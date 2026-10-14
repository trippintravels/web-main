// Settlements screen — per month, per partner. Pure math lives in settlelib.js
// (cash basis, collection-month, two pots, reimbursements, cancellation reversals,
// rotating residual). This screen picks a month, shows the pot totals + per-partner
// breakdown + blockers + staleness, and settles/un-settles the whole month atomically.
import { get, post, del } from './api.js';
import { I, svg } from './icons.js';
import { computeSettlement } from './settlelib.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money = (n) => (n < 0 ? '−₹' : '₹') + Math.abs(Math.round(n || 0)).toLocaleString('en-IN');
const thisMonth = () => new Date().toISOString().slice(0, 7);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthLabel = (ym) => { const [y, m] = ym.split('-'); return MONTHS[Number(m) - 1] + ' ' + y; };
const shiftMonth = (ym, delta) => { let [y, m] = ym.split('-').map(Number); m += delta; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } return y + '-' + String(m).padStart(2, '0'); };
const CHEV_L = '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
const CHEV_R = '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

export function renderSettlements(main){
  const state = { data: null, err: null, month: thisMonth(), busy: false, confirm: null };

  function load(){
    state.data = null; state.err = null; render();
    Promise.all(['travel-bookings','car-bookings','payments','expenses','split-config','users','settlements'].map(get))
      .then(([t, c, p, e, sc, u, st]) => {
        state.data = { travel: t.data, car: c.data, payments: p.data, expenses: e.data, versions: sc.data, users: u.data, settlements: st.data };
        render();
      })
      .catch(er => { state.err = er.message || 'Could not load'; render(); });
  }

  const monthSettlements = () => (state.data.settlements || []).filter(s => s.period_month === state.month);

  // months that have any activity, filled from the earliest up to the current month (newest first)
  function monthsList(){
    const d = state.data, set = new Set([thisMonth(), state.month]);
    const add = (s) => { const m = s && String(s).slice(0, 7); if (m && /^\d{4}-\d{2}$/.test(m)) set.add(m); };
    (d.travel || []).forEach(b => { add(b.start_date); add(b.end_date); });
    (d.car || []).forEach(c => { add(c.start_date); add(c.end_date); });
    (d.payments || []).forEach(p => add(p.received_on));
    (d.expenses || []).forEach(e => add(e.date));
    (d.settlements || []).forEach(s => add(s.period_month));
    const sorted = [...set].sort(); let cur = sorted[0]; const end = sorted[sorted.length - 1]; const out = [];
    while (cur <= end && out.length < 360) { out.push(cur); cur = shiftMonth(cur, 1); }
    return out.reverse();   // newest first; extends into the future up to the last booking month
  }
  const lastMonth = () => { const l = monthsList(); return l[0] || thisMonth(); };

  // ---------- render ----------
  function potsCard(r){
    const travelPot = r.pools.travelNet - r.pools.travelExp, carPot = r.pools.carNet - r.pools.carExp;
    const total = travelPot + carPot + r.pools.reimburse;
    const item = (k, v, sub) => '<div><span class="tt-cbsum-k">' + k + '</span><span class="tt-cbsum-v">' + v + '</span>' + (sub ? '<span class="tt-asub" style="display:block;">' + sub + '</span>' : '') + '</div>';
    return '<div class="tt-cbsum" style="flex-wrap:wrap;margin:4px 0 18px;">' +
      item('Travel pot', money(travelPot), 'net ' + money(r.pools.travelNet) + ' − exp ' + money(r.pools.travelExp)) +
      item('Car pot', money(carPot), 'net ' + money(r.pools.carNet) + ' − exp ' + money(r.pools.carExp)) +
      item('Reimbursements', money(r.pools.reimburse)) +
      item('Month total', money(total)) + '</div>';
  }
  function blockersCard(r){
    if (!r.blockers.length) return '';
    const rows = r.blockers.map(b => '<li><b>' + esc(b.ref) + '</b> — ' + esc(b.reason) + '</li>').join('');
    return '<div class="tt-sbblock"><div class="tt-delpanel-hd" style="color:var(--tt-amber);">Not settled this month (' + r.blockers.length + ')</div>' +
      '<div class="tt-asub">These trips have ended but aren’t recognizable yet — they’ll settle in whatever month they become fully paid / finalized. Nothing is lost.</div>' +
      '<ul class="tt-delpanel-list">' + rows + '</ul></div>';
  }
  function partnerTable(r){
    if (!r.partners.length) return '<div class="tt-card"><div class="tt-empty">Nothing to settle in ' + esc(state.month) + '.</div></div>';
    const rows = r.partners.map(p => {
      const status = p.settled
        ? (p.stale ? '<span class="tt-badge due" title="Changed by ' + money(p.delta) + ' since it was settled — re-settle to update">Needs update</span>' : '<span class="tt-badge ok">Settled</span>')
        : '<span class="tt-badge wait">Unsettled</span>';
      return '<tr><td>' + esc(p.name) + '</td>' +
        '<td class="tt-ref">' + money(p.travel) + '</td>' +
        '<td class="tt-ref">' + money(p.car) + '</td>' +
        '<td class="tt-ref">' + money(p.reimburse) + '</td>' +
        '<td class="tt-ref"><b>' + money(p.total) + '</b></td>' +
        '<td>' + status + '</td></tr>';
    }).join('');
    return '<div class="tt-card"><div class="tt-scrollx"><table class="tt-t">' +
      '<thead><tr><th>Partner</th><th>Travel</th><th>Car</th><th>Reimburse</th><th>Total</th><th>Status</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';
  }
  function actions(r){
    const settledRows = monthSettlements();
    const anySettled = settledRows.length > 0;
    const anyStale = r.partners.some(p => p.stale);
    const hasWork = r.partners.length > 0;
    if (state.confirm) {
      const label = state.confirm === 'settle' ? 'Settle ' + state.month + ' for all partners?'
                  : state.confirm === 'resettle' ? 'Re-settle ' + state.month + '? Replaces the existing snapshot.'
                  : 'Un-settle ' + state.month + '? Removes all its settlement records.';
      return '<div class="tt-delpanel"><div class="tt-asub">' + esc(label) + '</div>' +
        '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" id="sb-cxcancel">Cancel</button>' +
        '<button class="tt-abtn ' + (state.confirm === 'unsettle' ? 'danger' : '') + '" id="sb-cxok">' + (state.busy ? 'Working…' : 'Confirm') + '</button></div></div>';
    }
    let btns = '';
    if (!anySettled && hasWork) btns += '<button class="tt-btn prim" id="sb-settle">' + svg(I.check) + 'Settle month</button>';
    if (anySettled && anyStale) btns += '<button class="tt-btn prim" id="sb-resettle">' + svg(I.check) + 'Re-settle month</button>';
    if (anySettled) btns += '<button class="tt-btn ghost" id="sb-unsettle">Un-settle month</button>';
    const when = anySettled && settledRows[0].settled_at ? '<span class="tt-asub">Settled ' + esc(String(settledRows[0].settled_at).slice(0, 10)) + '</span>' : '';
    return btns ? '<div class="tt-factions" style="justify-content:flex-start;align-items:center;gap:12px;">' + btns + when + '</div>' : '';
  }

  function render(){
    const monthCtl = state.data
      ? '<div class="tt-monthpick">' +
          '<button class="tt-iconbtn" id="sb-prev" aria-label="Previous month">' + svg(CHEV_L) + '</button>' +
          '<select id="sb-month">' + monthsList().map(m => '<option value="' + m + '"' + (m === state.month ? ' selected' : '') + '>' + esc(monthLabel(m)) + '</option>').join('') + '</select>' +
          '<button class="tt-iconbtn" id="sb-next" aria-label="Next month"' + (state.month >= lastMonth() ? ' disabled' : '') + '>' + svg(CHEV_R) + '</button>' +
        '</div>'
      : '';
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Settlements</h1>' +
      '<div class="tt-lede">Per month, per partner. A booking settles the month it’s fully paid; the two pots split equally among their partners.</div></div>' +
      '<div class="tt-actions">' + monthCtl + '</div></div>';
    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.data) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else {
      const r = computeSettlement(state.data, state.month);
      h += potsCard(r) + blockersCard(r) + partnerTable(r) + actions(r);
    }
    main.innerHTML = h;
    wire();
  }

  function wire(){
    const q = (s) => main.querySelector(s);
    const m = q('#sb-month'); if (m) m.addEventListener('change', () => { state.month = m.value || thisMonth(); state.confirm = null; render(); });
    const pv = q('#sb-prev'); if (pv) pv.addEventListener('click', () => { state.month = shiftMonth(state.month, -1); state.confirm = null; render(); });
    const nx = q('#sb-next'); if (nx) nx.addEventListener('click', () => { if (state.month < lastMonth()) { state.month = shiftMonth(state.month, 1); state.confirm = null; render(); } });
    const s = q('#sb-settle'); if (s) s.addEventListener('click', () => { state.confirm = 'settle'; render(); });
    const rs = q('#sb-resettle'); if (rs) rs.addEventListener('click', () => { state.confirm = 'resettle'; render(); });
    const us = q('#sb-unsettle'); if (us) us.addEventListener('click', () => { state.confirm = 'unsettle'; render(); });
    const cc = q('#sb-cxcancel'); if (cc) cc.addEventListener('click', () => { state.confirm = null; render(); });
    const ok = q('#sb-cxok'); if (ok) ok.addEventListener('click', doConfirm);
  }

  async function doConfirm(){
    if (state.busy) return;
    state.busy = true; render();
    const action = state.confirm, month = state.month;
    try {
      const existing = monthSettlements();
      if (action === 'unsettle' || action === 'resettle') {
        for (const s of existing) await del('settlements/' + s.id);
      }
      if (action === 'settle' || action === 'resettle') {
        const r = computeSettlement(state.data, month);
        const todo = action === 'settle' ? r.partners.filter(p => !p.settled) : r.partners;
        for (const p of todo) await post('settlements', {
          user_id: p.user_id, period_month: month, amount_snapshot: p.total,
          breakdown_json: { travel: p.travel, car: p.car, reimbursements: p.reimburse },
        });
      }
    } catch (e) {
      state.err = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Settlement failed';
    }
    state.busy = false; state.confirm = null; load();
  }

  load();
}
