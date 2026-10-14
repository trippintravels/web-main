// settlelib.js — pure settlement engine (no DOM, no network; unit-testable).
// Cash basis, all-or-nothing, collection-month recognition. Two pots:
//   travel pot ← travel net ;  car pot ← standalone car net + travel-origin car net
// Split is equal among the effective version's members (resolved by BOOKING date);
// recognition MONTH is the month the booking became fully paid. Cancellation emits a
// reversal (−net) in ym(cancelled_at). Residuals rotate. See MONEY_FLOW.md.

const num = (v) => { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const ym = (s) => (s ? String(s).slice(0, 10).slice(0, 7) : null);

export function carAmount(c){
  if (!c) return null;
  if (c.pricing_type === 'distance') return c.distance_km == null || c.distance_km === '' ? null : (num(c.base_fare)||0) + num(c.distance_km)*(num(c.per_km_rate)||0);
  return num(c.flat_fare) || 0;
}
export const carNet = (c) => { const a = carAmount(c); return a == null ? null : a - (num(c.commission)||0) - (num(c.toll)||0) - (num(c.driver_cost)||0); };
export const travelNet = (b) => (num(b.booking_amount)||0) - (num(b.cost_except_car)||0) - (num(b.car_cost)||0) - (num(b.commission)||0);
const travelGross = (b) => num(b.booking_amount) || 0;
const bookDate = (b) => b.end_date || b.start_date || (b.created_at ? String(b.created_at).slice(0, 10) : null);

// month the cumulative payments first reach gross (null if gross unknown or not fully paid)
export function fullPaidMonth(gross, date, pays){
  if (gross == null) return null;
  if (gross <= 0) return ym(date);
  let cum = 0;
  for (const p of pays.slice().sort((a, b) => String(a.received_on).localeCompare(String(b.received_on)))) {
    cum += (num(p.amount) || 0);
    if (cum >= gross) return ym(p.received_on);
  }
  return null;
}

// rotate-residual integer split of A among members[], residual starts at seed%n
export function distribute(A, members, seed){
  const n = members.length, out = {}; if (!n) return out;
  const q = Math.floor(A / n); let r = A - q * n;   // r ∈ [0, n)
  const off = ((seed % n) + n) % n;
  for (let i = 0; i < n; i++) out[members[i]] = q;
  for (let i = 0; i < r; i++) out[members[(off + i) % n]] += 1;
  return out;
}

function resolveMembers(versions, stream, date){
  const vs = versions.filter(v => v.stream === stream && String(v.effective_from) <= String(date));
  if (!vs.length) return null;
  vs.sort((a, b) => String(b.effective_from).localeCompare(String(a.effective_from)));
  return (vs[0].members || []).map(m => m.user_id);
}

// data = { travel, car, payments, expenses, versions, users, settlements }
export function computeSettlement(data, month){
  const travel = data.travel || [], car = data.car || [], payments = data.payments || [],
        expenses = data.expenses || [], versions = data.versions || [], users = data.users || [],
        settlements = data.settlements || [];
  const payT = {}, payC = {};
  payments.forEach(p => { if (p.travel_booking_id != null) (payT[p.travel_booking_id] = payT[p.travel_booking_id] || []).push(p);
                          if (p.car_booking_id != null) (payC[p.car_booking_id] = payC[p.car_booking_id] || []).push(p); });
  const linkedCar = {}; car.forEach(c => { if (c.origin === 'travel' && c.travel_booking_id != null) linkedCar[c.travel_booking_id] = c; });

  const per = {}; const ensure = (uid) => (per[uid] = per[uid] || { travel: 0, car: 0, reimburse: 0 });
  const pools = { travelNet: 0, carNet: 0, travelExp: 0, carExp: 0, reimburse: 0 };
  const blockers = [], detail = [];
  // split `net` among `members` (seeded), then add sign*share per partner. Reverse
  // (sign −1) is the EXACT element-wise negation of recognize (sign +1): same net,
  // members and seed → a same-month recognize+reverse nets to exactly 0 per partner.
  function addPool(agg, net, members, seed, sign){
    if (!members) return false;
    const d = distribute(net, members, seed);
    for (const uid in d) ensure(uid)[agg] += sign * d[uid];
    return true;
  }

  // ---- travel bookings (+ their linked car) ----
  // Two independent events: +net in the full-paid month, −net in the cancel month.
  // When both fall in the same month they both fire and net to 0 (fixes A1).
  travel.forEach(b => {
    const date = bookDate(b), net = travelNet(b);
    const fp = fullPaidMonth(travelGross(b), date, payT[b.id] || []);
    const lc = linkedCar[b.id], cNet = lc ? carNet(lc) : null;
    const signs = [];
    if (fp === month) signs.push(1);                                              // recognize
    if (b.cancelled && ym(b.cancelled_at) === month && fp != null) signs.push(-1); // reverse
    if (!signs.length) return;
    const tm = resolveMembers(versions, 'travel', date);
    if (!tm) blockers.push({ kind: 'no-version', ref: b.display_id, reason: 'no travel split version at ' + date });
    else for (const sign of signs) { addPool('travel', net, tm, b.id, sign); pools.travelNet += sign * net; detail.push({ ref: b.display_id, pool: 'travel', net: sign * net, kind: sign > 0 ? 'recognize' : 'reverse' }); }
    if (lc && cNet != null) {
      const cm = resolveMembers(versions, 'car', date);
      if (!cm) blockers.push({ kind: 'no-version', ref: b.display_id + ' (car)', reason: 'no car split version at ' + date });
      else for (const sign of signs) { addPool('car', cNet, cm, lc.id, sign); pools.carNet += sign * cNet; detail.push({ ref: b.display_id + ' (car)', pool: 'car', net: sign * cNet, kind: sign > 0 ? 'recognize' : 'reverse' }); }
    }
  });

  // ---- standalone car bookings ----
  car.filter(c => c.origin === 'standalone').forEach(c => {
    const date = bookDate(c), net = carNet(c);
    if (net == null) return;
    const fp = fullPaidMonth(carAmount(c), date, payC[c.id] || []);
    const signs = [];
    if (fp === month) signs.push(1);
    if (c.cancelled && ym(c.cancelled_at) === month && fp != null) signs.push(-1);
    if (!signs.length) return;
    const cm = resolveMembers(versions, 'car', date);
    if (!cm) blockers.push({ kind: 'no-version', ref: c.display_id, reason: 'no car split version at ' + date });
    else for (const sign of signs) { addPool('car', net, cm, c.id, sign); pools.carNet += sign * net; detail.push({ ref: c.display_id, pool: 'car', net: sign * net, kind: sign > 0 ? 'recognize' : 'reverse' }); }
  });

  // ---- expenses dated in the month ----
  expenses.forEach(e => {
    if (ym(e.date) !== month) return;
    const stream = e.category === 'agency' ? 'travel' : 'car', amt = num(e.amount) || 0;
    const members = resolveMembers(versions, stream, e.date);
    if (!members) blockers.push({ kind: 'no-version', ref: 'expense #' + e.id, reason: 'no ' + stream + ' split version at ' + e.date });
    else { addPool(stream, amt, members, e.id, -1); if (stream === 'travel') pools.travelExp += amt; else pools.carExp += amt; }
    if (e.paid_by_user_id != null) { ensure(e.paid_by_user_id).reimburse += amt; pools.reimburse += amt; }
    detail.push({ ref: 'expense #' + e.id, pool: stream, net: -amt, kind: 'expense', reimburse: amt });
  });

  // ---- blockers: trips that have ended but aren't recognizable yet ----
  const todayStr = new Date().toISOString().slice(0, 10);
  travel.concat(car.filter(c => c.origin === 'standalone')).forEach(b => {
    if (b.cancelled) return;
    const isTravel = b.booking_amount !== undefined;
    const g = isTravel ? travelGross(b) : carAmount(b);
    const fp = fullPaidMonth(g, bookDate(b), (isTravel ? payT[b.id] : payC[b.id]) || []);
    const when = b.end_date || b.start_date || '';
    if (fp == null && when && when <= todayStr)
      blockers.push({ kind: 'unrecognized', ref: b.display_id, reason: g == null ? 'amount pending (enter distance)' : 'not fully paid' });
  });

  // ---- partners + staleness vs existing settlement snapshots ----
  const nameOf = (uid) => { const u = users.find(x => x.id === uid); return u ? u.name : ('#' + uid); };
  const settledMap = {}; settlements.forEach(s => { if (s.period_month === month) settledMap[s.user_id] = s; });
  const uids = new Set(Object.keys(per).map(Number)); Object.keys(settledMap).forEach(u => uids.add(Number(u)));
  const partners = [...uids].map(uid => {
    const p = per[uid] || { travel: 0, car: 0, reimburse: 0 };
    const total = p.travel + p.car + p.reimburse;
    const s = settledMap[uid], settled = !!s, snap = s ? (num(s.amount_snapshot) || 0) : null;
    return { user_id: uid, name: nameOf(uid), travel: p.travel, car: p.car, reimburse: p.reimburse, total,
             settled, snapshot: snap, stale: settled && snap !== total, delta: settled ? total - snap : 0 };
  }).sort((a, b) => a.user_id - b.user_id);

  return { month, pools, partners, blockers, detail };
}
