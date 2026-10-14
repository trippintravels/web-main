// Pure data layer for the dashboard — turns raw API rows into the `D` object
// the design's build/draw functions already consume. No DOM, no network here,
// so it is unit-testable on its own.

const D0 = () => { const t = new Date(); t.setHours(0,0,0,0); return t; };
const days = (s) => { if (!s) return null; const t = D0(); return Math.ceil((new Date(String(s).slice(0,10)) - t) / 864e5); };
const dpart = (s) => (s ? String(s).slice(0,10) : null);
const ym = (s) => (s ? String(s).slice(0,7) : null);
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const money = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const moneyShort = (n) => { n = n || 0; return n >= 1e5 ? '₹' + (n/1e5).toFixed(2) + 'L' : money(n); };
const fmtShort = (d) => d.getDate() + ' ' + MON[d.getMonth()];
const rel = (s) => { if (!s) return ''; const ms = Date.now() - new Date(String(s).replace(' ','T')+'Z').getTime();
  const h = Math.floor(ms/3.6e6); if (h < 1) return 'just now'; if (h < 24) return h + 'h ago';
  const d = Math.floor(h/24); return d + 'd ago'; };

const DOCS = [['insurance_expiry','Insurance'],['pollution_expiry','Pollution'],['fitness_expiry','Fitness'],
  ['permit_expiry','Permit'],['road_tax_expiry','Road tax'],['vltd_expiry','VLTD']];

const carAmount = (c) => {
  if (c.pricing_type === 'distance') return c.distance_km == null ? null : (c.base_fare||0) + c.distance_km*(c.per_km_rate||0);
  return c.flat_fare || 0;
};
const sevForDays = (n) => (n == null ? 'low' : n < 0 ? 'high' : n <= 7 ? 'high' : n <= 21 ? 'med' : 'low');
const expTag = (n) => (n < 0 ? 'Expired ' + Math.abs(n) + 'd' : n + ' day' + (n === 1 ? '' : 's'));

export function computeD(d) {
  const travel = d.travel || [], car = d.car || [], cars = d.cars || [],
        drivers = d.drivers || [], users = d.users || [], payments = d.payments || [];
  const t = D0();

  // payment sums
  const paidT = {}, paidC = {};
  payments.forEach(p => {
    if (p.travel_booking_id) paidT[p.travel_booking_id] = (paidT[p.travel_booking_id]||0) + p.amount;
    if (p.car_booking_id)    paidC[p.car_booking_id]    = (paidC[p.car_booking_id]||0) + p.amount;
  });
  const driverById = {}; drivers.forEach(x => driverById[x.id] = x);
  const linkedCar = {}; car.forEach(c => { if (c.origin === 'travel' && c.travel_booking_id) linkedCar[c.travel_booking_id] = c; });
  const standalone = car.filter(c => c.origin === 'standalone');
  // cancelled bookings stay on record but leave the pot: excluded from every
  // pending / revenue / action / departure figure below (still shown in activity).
  const live = (b) => !b.cancelled;
  const travelLive = travel.filter(live);
  const standaloneLive = standalone.filter(live);

  const travelAmt = (b) => b.booking_amount || 0;
  // travel pot: travel_net = gross − cost_except_car − car_cost(entered) − commission
  const travelNet = (b) => travelAmt(b) - (b.cost_except_car||0) - (b.car_cost||0) - (b.commission||0);
  const carNet = (c) => { const a = carAmount(c); return a == null ? 0 : a - (c.commission||0) - (c.toll||0) - (c.driver_cost||0); };

  // ---- pending (all bookings with a known amount) ----
  let pendingTotal = 0, pendingCount = 0;
  travelLive.forEach(b => { const pend = travelAmt(b) - (paidT[b.id]||0); if (pend > 0) { pendingTotal += pend; pendingCount++; } });
  standaloneLive.forEach(c => { const a = carAmount(c); if (a == null) return; const pend = a - (paidC[c.id]||0); if (pend > 0) { pendingTotal += pend; pendingCount++; } });

  // ---- monthly revenue (last 6 months, in lakhs) ----
  const months = []; for (let i = 5; i >= 0; i--) { const dt = new Date(t.getFullYear(), t.getMonth()-i, 1); months.push({ key: dt.toISOString().slice(0,7), label: MON[dt.getMonth()] }); }
  const grossByMonth = {}, netByMonth = {}; months.forEach(m => { grossByMonth[m.key] = 0; netByMonth[m.key] = 0; });
  const bMonth = (b) => ym(b.start_date) || ym(dpart(b.created_at));
  travelLive.forEach(b => { const k = bMonth(b); if (k in grossByMonth) { grossByMonth[k] += travelAmt(b); netByMonth[k] += travelNet(b); } });
  standaloneLive.forEach(c => { const k = bMonth(c); if (k in grossByMonth) { const a = carAmount(c)||0; grossByMonth[k] += a; netByMonth[k] += carNet(c); } });
  const revGross = months.map(m => +(grossByMonth[m.key]/1e5).toFixed(2));
  const curKey = months[months.length-1].key, prevKey = months[months.length-2].key;
  const revNet = +(netByMonth[curKey]/1e5).toFixed(2);
  const grossCur = grossByMonth[curKey], grossPrev = grossByMonth[prevKey];
  const revDelta = grossPrev > 0 ? Math.round((grossCur-grossPrev)/grossPrev*100) : (grossCur > 0 ? 100 : 0);

  // ---- weekly trend (last 8 weeks, by created_at) ----
  const wb = (items) => { const counts = new Array(8).fill(0);
    items.forEach(it => { const ds = dpart(it.created_at); if (!ds) return; const diff = Math.floor((t - new Date(ds))/864e5);
      if (diff < 0 || diff >= 56) return; const b = 7 - Math.floor(diff/7); if (b >= 0 && b < 8) counts[b]++; }); return counts; };
  const labels8 = []; for (let b = 0; b < 8; b++) { const ws = new Date(t); ws.setDate(ws.getDate()-7*(7-b)); labels8.push(fmtShort(ws)); }
  const trTravel = wb(travel), trCar = wb(car);
  const dlt = (arr) => { const a = arr[7], b = arr[6]; const diff = a-b; return { delta: (diff>=0?'+':'') + diff, dir: diff>0?'up':diff<0?'down':'flat' }; };

  // ---- primes ----
  const travelLinkedN = car.filter(c => c.origin === 'travel').length;
  const primes = [
    Object.assign({ ic:'travel', cls:'terra', label:'Travel bookings', value:String(travel.length), sub:'all time', dlabel:'vs last week', series: trTravel }, dlt(trTravel)),
    Object.assign({ ic:'car', cls:'sky', label:'Car bookings', value:String(car.length), sub:'incl. '+travelLinkedN+' travel-linked', dlabel:'vs last week', series: trCar }, dlt(trCar)),
    { ic:'rev', cls:'gold', label:'Revenue', value: moneyShort(grossCur), sub: MON[t.getMonth()]+' · gross', delta:(revDelta>=0?'+':'')+revDelta+'%', dir: revDelta>0?'up':revDelta<0?'down':'flat', dlabel:'vs last month', series: revGross },
  ];

  // ---- stats ----
  const activeCars = cars.filter(c => c.active);
  const docSoon = activeCars.filter(c => DOCS.some(([f]) => { const n = days(c[f]); return n != null && n <= 30; })).length;
  const stats = [
    { ic:'fleet', cls:'olive', v:String(activeCars.length), l:'Fleet cars', h: cars.length+' in fleet' },
    { ic:'driver', cls:'terra', v:String(drivers.filter(x=>x.active).length), l:'Drivers', h: drivers.length+' total' },
    { ic:'partners', cls:'sky', v:String(users.filter(x=>x.active).length), l:'Partners', h:'revenue split' },
    { ic:'pay', cls:'ink', v: money(pendingTotal), l:'Pending', h: pendingCount+' bookings', money:true, id:'stat-pending' },
    { ic:'doc', cls:'ink', v:String(docSoon), l:'Docs expiring', h:'within 30 days', alert:true },
  ];

  // ---- action required ----
  const actions = []; let n = 0;
  // document expiries (cars)
  activeCars.forEach(c => DOCS.forEach(([f,lbl]) => { const dd = days(c[f]); if (dd != null && dd <= 30) {
    actions.push({ id:'ac'+(n++), cat:'document', sev: sevForDays(dd), ic:'doc', t: lbl+' — '+c.registration_no,
      s: [c.make,c.model].filter(Boolean).join(' ')+' · '+lbl.toLowerCase(), tag: expTag(dd), act:{ k:'link', l:'Upload renewal' } }); } }));
  // driver licence expiries
  drivers.filter(x=>x.active).forEach(dr => { const dd = days(dr.licence_expiry); if (dd != null && dd <= 30) {
    actions.push({ id:'ac'+(n++), cat:'document', sev: sevForDays(dd), ic:'driver', t:'Driver licence — '+dr.name,
      s:'Commercial licence renewal', tag: expTag(dd), act:{ k:'link', l:'Upload renewal' } }); } });
  // payments pending & past due
  travelLive.forEach(b => { const dd = days(b.end_date); if (dd != null && dd < 0) { const pend = travelAmt(b) - (paidT[b.id]||0);
    if (pend > 0) actions.push({ id:'ac'+(n++), cat:'payment', sev:'high', ic:'pay', t:'Payment pending — '+b.display_id,
      s:(b.customer_name||'Traveller')+' · ended '+b.end_date, tag: money(pend)+' left', act:{ k:'received', amt: pend, bt:'travel', bid: b.id } }); } });
  standaloneLive.forEach(c => { const dd = days(c.end_date); if (dd == null || dd >= 0) return;
    if (c.pricing_type === 'distance' && c.distance_km == null) {
      actions.push({ id:'ac'+(n++), cat:'distance', sev:'high', ic:'car', t:'Distance not entered — '+c.display_id,
        s:(c.route||c.duty_type||'Car booking')+' · distance pricing · ended '+c.end_date, tag:'Amount pending', act:{ k:'distance', bid: c.id } });
    } else { const a = carAmount(c); const pend = (a||0) - (paidC[c.id]||0);
      if (pend > 0) actions.push({ id:'ac'+(n++), cat:'payment', sev:'high', ic:'pay', t:'Payment pending — '+c.display_id,
        s:(c.route||c.duty_type||'Car booking')+' · ended '+c.end_date, tag: money(pend)+' left', act:{ k:'received', amt: pend, bt:'car', bid: c.id } }); } });
  // upcoming car bookings with no driver
  standaloneLive.forEach(c => { const dd = days(c.start_date); if (dd != null && dd >= 0 && !c.driver_id) {
    actions.push({ id:'ac'+(n++), cat:'fleet', sev:'med', ic:'driver', t:'No driver assigned — '+c.display_id,
      s:(c.route||c.duty_type||'')+' · departs '+(c.start_date||'soon'), tag:'Unassigned', act:{ k:'link', l:'Assign driver' } }); } });
  const sevRank = { high:0, med:1, low:2 };
  actions.sort((a,b) => sevRank[a.sev]-sevRank[b.sev]);

  const allFilters = [{k:'all',l:'All'},{k:'document',l:'Documents'},{k:'payment',l:'Payments'},{k:'distance',l:'Distance'},{k:'fleet',l:'Fleet'}];
  const filters = allFilters.filter(f => f.k === 'all' || actions.some(a => a.cat === f.k));

  // ---- recent activity (latest 5 bookings) ----
  const actRows = [];
  travel.forEach(b => actRows.push({ _ts: b.created_at, ref: b.display_id, type:'Travel', who: b.customer_name || '—',
    detail: b.itinerary || '', amount: travelAmt(b), paid: paidT[b.id]||0, end: b.end_date, cancelled: b.cancelled }));
  standalone.forEach(c => actRows.push({ _ts: c.created_at, ref: c.display_id, type:'Car', who: c.route || c.duty_type || 'Car hire',
    detail: [c.duty_type, c.route].filter(Boolean).join(' · '), amount: carAmount(c), paid: paidC[c.id]||0, end: c.end_date, cancelled: c.cancelled }));
  actRows.sort((a,b) => String(b._ts).localeCompare(String(a._ts)));
  const activity = actRows.slice(0,5).map(r => {
    let badge, bl;
    if (r.cancelled) { badge = 'done'; bl = 'Cancelled'; }
    else if (r.amount == null) { badge = 'wait'; bl = 'Dist pending'; }
    else { const pend = r.amount - r.paid;
      if (pend <= 0) { badge = 'ok'; bl = 'Paid'; }
      else if (days(r.end) != null && days(r.end) < 0) { badge = 'due'; bl = money(pend) + ' due'; }
      else { badge = 'wait'; bl = 'Confirmed'; } }
    return { ref: r.ref, type: r.type, who: r.who, detail: r.detail, amt: r.amount == null ? '—' : money(r.amount), badge, bl, when: rel(r._ts) };
  });

  // ---- upcoming departures (next 4 by start_date) ----
  const dep = [];
  travelLive.forEach(b => { if (days(b.start_date) != null && days(b.start_date) >= 0) { const drv = linkedCar[b.id] && driverById[linkedCar[b.id].driver_id];
    dep.push({ _d: b.start_date, place: b.itinerary || 'Trip', guests: (b.customer_name||'Guest') + (b.pax?' +'+b.pax:'') + (drv?' · driver '+drv.name:''), hasDriver: !!drv }); } });
  standaloneLive.forEach(c => { if (days(c.start_date) != null && days(c.start_date) >= 0) { const drv = driverById[c.driver_id];
    dep.push({ _d: c.start_date, place: c.route || c.duty_type || 'Car', guests: drv ? 'driver '+drv.name : 'no driver yet', hasDriver: !!drv }); } });
  dep.sort((a,b) => String(a._d).localeCompare(String(b._d)));
  const departures = dep.slice(0,4).map(x => { const dt = new Date(String(x._d).slice(0,10));
    return { d: String(dt.getDate()), m: DOW[dt.getDay()], place: x.place, guests: x.guests, stat: x.hasDriver?'ok':'due', sl: x.hasDriver?'Ready':'Needs driver' }; });

  return { primes, stats, trend:{ labels: labels8, travel: trTravel, car: trCar },
    revenue:{ labels: months.map(m=>m.label), gross: revGross, net: revNet },
    actions, filters, activity, departures,
    _pendingTotal: pendingTotal, _pendingCount: pendingCount,
    _lede: { items: actions.length, pendingTotal, pendingCount } };
}
