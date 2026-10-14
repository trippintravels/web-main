// Payments screen — record a payment against a travel booking or a standalone car
// booking (exactly one, enforced by the DB CHECK + the Worker). pending/paid are
// FE-computed: pending = booking amount − Σ payments. Travel-origin car bookings
// take no payments (the customer pays the travel booking), so they're excluded.
import { get, post, del } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const num = (v) => { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const today = () => new Date().toISOString().slice(0, 10);
function carAmount(c){
  if (!c) return null;
  if (c.pricing_type === 'distance') return c.distance_km == null || c.distance_km === '' ? null : (num(c.base_fare)||0) + num(c.distance_km)*(num(c.per_km_rate)||0);
  return num(c.flat_fare) || 0;
}

export function renderPayments(main){
  const state = { travel: null, carb: [], rows: [], err: null, form: null, confirmDel: null, q: '' };

  function load(){
    state.travel = null; state.err = null; render();
    Promise.all([get('travel-bookings'), get('car-bookings'), get('payments')])
      .then(([t, c, p]) => { state.travel = t.data; state.carb = c.data; state.rows = p.data; render(); })
      .catch(e => { state.err = e.message || 'Could not load'; render(); });
  }

  // ---- lookups + pending ----
  const paidT = (id) => state.rows.reduce((s, p) => s + (p.travel_booking_id === id ? (p.amount||0) : 0), 0);
  const paidC = (id) => state.rows.reduce((s, p) => s + (p.car_booking_id === id ? (p.amount||0) : 0), 0);
  const travelById = (id) => (state.travel || []).find(b => b.id === id);
  const carById = (id) => state.carb.find(c => c.id === id);
  const grossT = (b) => num(b.booking_amount) || 0;
  function pendingOf(type, b){
    if (type === 'car') { const a = carAmount(b); return a == null ? null : a - paidC(b.id); }
    return grossT(b) - paidT(b.id);
  }
  const bookingLabel = (type, b) => b.display_id + ' · ' + (type === 'car'
    ? (b.route || b.duty_type || 'Car') + (b.registration_no ? ' · ' + b.registration_no : '')
    : (b.customer_name || 'Traveller'));

  // ---------- form ----------
  function bookingOptions(type, sel){
    const list = type === 'car'
      ? state.carb.filter(c => c.origin === 'standalone' && !c.cancelled)
      : (state.travel || []).filter(b => !b.cancelled);
    return '<option value="">Select booking…</option>' + list.map(b => {
      const pend = pendingOf(type, b);
      const tail = pend == null ? ' — amount pending' : (pend <= 0 ? ' — paid' : ' — ' + money(pend) + ' due');
      return '<option value="' + b.id + '"' + (String(b.id) === String(sel) ? ' selected' : '') + '>' + esc(bookingLabel(type, b) + tail) + '</option>';
    }).join('');
  }
  function pendingHint(f){
    if (!f.booking_id) return '';
    const b = f.type === 'car' ? carById(Number(f.booking_id)) : travelById(Number(f.booking_id));
    if (!b) return '';
    const pend = pendingOf(f.type, b);
    if (pend == null) return '<span class="tt-badge wait">Amount pending — enter distance first</span>';
    return pend <= 0 ? '<span class="tt-badge ok">Fully paid</span>'
                     : '<span class="tt-asub">Outstanding <b>' + money(pend) + '</b></span> <button class="tt-abtn soft" id="pm-full" type="button">Pay full</button>';
  }
  function paymentForm(f){
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>Record payment</h2></div>' +
      '<div class="tt-fgrid">' +
        '<label class="tt-field"><span>Against</span><select data-pf="type"><option value="travel"' + (f.type !== 'car' ? ' selected' : '') + '>Travel booking</option><option value="car"' + (f.type === 'car' ? ' selected' : '') + '>Car booking</option></select></label>' +
        '<label class="tt-field"><span>Booking</span><select data-pf="booking_id">' + bookingOptions(f.type, f.booking_id) + '</select></label>' +
        '<label class="tt-field"><span>Amount</span><input type="number" min="0" step="1" data-pf="amount" value="' + esc(f.amount == null ? '' : f.amount) + '" placeholder="₹"></label>' +
        '<label class="tt-field"><span>Received on</span><input type="date" data-pf="received_on" value="' + esc(f.received_on || today()) + '"></label>' +
        '<label class="tt-field"><span>Note</span><input type="text" data-pf="note" value="' + esc(f.note || '') + '" placeholder="e.g. advance, UPI"></label>' +
      '</div>' +
      '<div class="tt-pmhint" id="pm-hint">' + pendingHint(f) + '</div>' +
      '<div class="tt-ferr" id="pm-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="pm-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="pm-save">Record payment</button></div></div>';
  }

  // ---------- list ----------
  function matches(p){
    if (!state.q) return true;
    const b = p.travel_booking_id ? travelById(p.travel_booking_id) : carById(p.car_booking_id);
    const type = p.travel_booking_id ? 'travel' : 'car';
    const hay = [b && bookingLabel(type, b), p.note, p.received_on, p.amount].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(state.q.toLowerCase());
  }
  function rowHtml(p){
    const isTravel = !!p.travel_booking_id;
    const b = isTravel ? travelById(p.travel_booking_id) : carById(p.car_booking_id);
    const ref = b ? bookingLabel(isTravel ? 'travel' : 'car', b) : (isTravel ? 'Travel #' + p.travel_booking_id : 'Car #' + p.car_booking_id);
    const acts = state.confirmDel === p.id
      ? '<span class="tt-asub" style="align-self:center;">Delete?</span><button class="tt-abtn soft" data-dcancel="' + p.id + '">No</button><button class="tt-abtn danger" data-dok="' + p.id + '">Yes</button>'
      : '<button class="tt-abtn danger" data-del="' + p.id + '">Delete</button>';
    return '<div class="tt-prow">' +
        '<div class="tt-prow-main"><div class="tt-who">' + money(p.amount) +
          ' <span class="tt-type ' + (isTravel ? 'travel' : 'car') + '">' + (isTravel ? 'Travel' : 'Car') + '</span></div>' +
          '<div class="tt-prow-sub">' + esc(ref) + '</div>' +
          '<div class="tt-prow-sub">' + esc(p.received_on || '') + (p.note ? ' · ' + esc(p.note) : '') + '</div></div>' +
        '<div class="tt-prow-side"><div class="tt-prow-acts">' + acts + '</div></div></div>';
  }
  function renderList(){
    const list = main.querySelector('#pm-list'); if (!list) return;
    const rows = state.rows.filter(matches);
    const cnt = main.querySelector('#pm-count'); if (cnt) cnt.textContent = '(' + rows.length + ' of ' + state.rows.length + (state.rows.length === 1 ? ' payment' : ' payments') + ')';
    list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<div class="tt-empty">No payments' + (state.q ? ' match your search' : ' yet') + '.</div>';
    wireRows();
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Payments</h1>' +
      '<div class="tt-lede">Money received against a travel or car booking. Pending is the booking amount minus payments.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="pm-add">' + svg(I.plus) + 'Record payment</button></div></div>';
    if (state.form) h += paymentForm(state.form);
    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.travel) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else {
      h += '<div class="tt-cbfilters"><div class="tt-fhdr">Payments <span class="tt-asub" id="pm-count"></span></div>' +
        '<div class="tt-fbar"><label class="tt-field tt-fltwide"><span>Search</span><input type="text" data-pq value="' + esc(state.q) + '" placeholder="booking, note, date, amount…"></label></div></div>' +
        '<div class="tt-card"><div class="tt-plist" id="pm-list"></div></div>';
    }
    main.innerHTML = h;
    wireChrome();
    if (state.travel && !state.err) renderList();
  }

  // ---------- wiring ----------
  function readForm(){ const o = {}; main.querySelectorAll('[data-pf]').forEach(i => o[i.getAttribute('data-pf')] = i.value); return o; }
  function syncForm(){ if (state.form) Object.assign(state.form, readForm()); }
  function wireChrome(){
    const q = (s) => main.querySelector(s);
    const add = q('#pm-add'); if (add) add.addEventListener('click', () => { state.form = { type:'travel', booking_id:'', amount:'', received_on: today(), note:'' }; render(); });
    const cancel = q('#pm-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#pm-save'); if (save) save.addEventListener('click', doSave);
    const type = q('[data-pf="type"]'); if (type) type.addEventListener('change', () => { syncForm(); state.form.type = type.value; state.form.booking_id = ''; render(); });
    const bk = q('[data-pf="booking_id"]'); if (bk) bk.addEventListener('change', () => {
      syncForm();
      const b = state.form.type === 'car' ? carById(Number(state.form.booking_id)) : travelById(Number(state.form.booking_id));
      const pend = b ? pendingOf(state.form.type, b) : null;
      if (pend != null && pend > 0) { state.form.amount = pend; const a = q('[data-pf="amount"]'); if (a) a.value = pend; }
      const hint = q('#pm-hint'); if (hint) hint.innerHTML = pendingHint(state.form);
      const full = q('#pm-full'); if (full) full.addEventListener('click', () => { if (pend > 0) { state.form.amount = pend; const a = q('[data-pf="amount"]'); if (a) a.value = pend; } });
    });
    const full0 = q('#pm-full'); if (full0) full0.addEventListener('click', () => {
      const b = state.form.type === 'car' ? carById(Number(state.form.booking_id)) : travelById(Number(state.form.booking_id));
      const pend = b ? pendingOf(state.form.type, b) : null; if (pend > 0) { state.form.amount = pend; const a = q('[data-pf="amount"]'); if (a) a.value = pend; }
    });
    const sq = q('[data-pq]'); if (sq) sq.addEventListener('input', () => { state.q = sq.value; renderList(); });
  }
  function wireRows(){
    main.querySelectorAll('#pm-list [data-del]').forEach(b => b.addEventListener('click', () => { state.confirmDel = Number(b.getAttribute('data-del')); renderList(); }));
    main.querySelectorAll('#pm-list [data-dcancel]').forEach(b => b.addEventListener('click', () => { state.confirmDel = null; renderList(); }));
    main.querySelectorAll('#pm-list [data-dok]').forEach(b => b.addEventListener('click', () => doDelete(Number(b.getAttribute('data-dok')), b)));
  }

  function doSave(){
    syncForm();
    const f = state.form, err = main.querySelector('#pm-ferr'); err.textContent = '';
    if (!f.booking_id) { err.textContent = 'Pick a booking.'; return; }
    if (num(f.amount) == null || num(f.amount) <= 0) { err.textContent = 'Enter an amount greater than zero.'; return; }
    if (!f.received_on) { err.textContent = 'Pick the received date.'; return; }
    const payload = { amount: num(f.amount), received_on: f.received_on, note: (f.note || '').trim() || null };
    if (f.type === 'car') payload.car_booking_id = Number(f.booking_id); else payload.travel_booking_id = Number(f.booking_id);
    const btn = main.querySelector('#pm-save'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    post('payments', payload)
      .then(() => { state.form = null; load(); })
      .catch(e => { err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
        if (btn) { btn.disabled = false; btn.textContent = 'Record payment'; } });
  }
  function doDelete(id, btn){
    if (btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }
    del('payments/' + id).then(() => { state.confirmDel = null; load(); }).catch(() => { state.confirmDel = null; load(); });
  }

  load();
}
