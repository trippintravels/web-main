// Car bookings screen — standalone car hires plus the read-mostly rows created
// by a travel booking (origin='travel', sharing the parent T#). Pricing is flat
// or distance; distance amount is PENDING until distance_km is entered at trip
// end. Amount/net are computed on the frontend (same logic as dashlib.js).
// Travel-origin rows take NO payments and only expose trip-end fields for edit.
import { get, post, patch } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const DUTY = ['Local','Dooars','Hills','Airport','NJP','Others'];
const num = (v) => { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; };

// amount (null = pending), net (null when amount pending) — mirrors dashlib.js
function carAmount(c){
  if (c.pricing_type === 'distance') return c.distance_km == null || c.distance_km === '' ? null : (num(c.base_fare)||0) + num(c.distance_km)*(num(c.per_km_rate)||0);
  return num(c.flat_fare) || 0;
}
function carNet(c){ const a = carAmount(c); return a == null ? null : a - (num(c.commission)||0) - (num(c.toll)||0) - (num(c.driver_cost)||0); }

const fmtRange = (a, b) => [a, b].filter(Boolean).join(' → ') || 'Dates TBD';
const nowTs = () => new Date().toISOString().slice(0, 19).replace('T', ' ');  // matches DB datetime('now')
const today = () => new Date().toISOString().slice(0, 10);

const emptyFilters = () => ({ q:'', car:'', driver:'', duty:'', origin:'', pricing:'', status:'', from:'', to:'' });

export function renderCarBookings(main){
  const state = { rows: null, cars: [], drivers: [], err: null, form: null, cancelId: null, filters: emptyFilters(), expanded: false };

  function load(){
    state.rows = null; state.err = null; render();
    Promise.all([get('car-bookings'), get('cars'), get('drivers')])
      .then(([b, c, d]) => { state.rows = b.data; state.cars = c.data; state.drivers = d.data; render(); })
      .catch(e => { state.err = e.message || 'Could not load'; render(); });
  }

  const carLabel = (c) => [c.make, c.model].filter(Boolean).join(' ') + (c.registration_no ? ' · ' + c.registration_no : '');

  // ---------- form ----------
  // option lists: active records, plus the current selection even if inactive
  function carOptions(sel, row){
    const list = state.cars.filter(c => c.active || String(c.id) === String(sel));
    if (sel && !list.some(c => String(c.id) === String(sel)) && row)
      list.unshift({ id: sel, make: row.make, model: row.model, registration_no: row.registration_no });
    return '<option value="">Select car…</option>' +
      list.map(c => '<option value="' + c.id + '"' + (String(c.id) === String(sel) ? ' selected' : '') + '>' + esc(carLabel(c)) + '</option>').join('');
  }
  function driverOptions(sel, row){
    const list = state.drivers.filter(d => d.active || String(d.id) === String(sel));
    if (sel && !list.some(d => String(d.id) === String(sel)) && row && row.driver_name)
      list.unshift({ id: sel, name: row.driver_name });
    return '<option value="">No driver</option>' +
      list.map(d => '<option value="' + d.id + '"' + (String(d.id) === String(sel) ? ' selected' : '') + '>' + esc(d.name) + '</option>').join('');
  }
  function fin(label, name, val, { type='text', ph='', lock=false, hint='' } = {}){
    return '<label class="tt-field"><span>' + label + (hint ? ' <span class="tt-hint">' + hint + '</span>' : '') + '</span>' +
      '<input type="' + type + '" data-f="' + name + '" value="' + esc(val == null ? '' : val) + '"' +
      (type === 'number' ? ' min="0" step="1"' : '') + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (lock ? ' disabled' : '') + '></label>';
  }
  function fsel(label, name, optsHtml, lock=false){
    return '<label class="tt-field"><span>' + label + '</span><select data-f="' + name + '"' + (lock ? ' disabled' : '') + '>' + optsHtml + '</select></label>';
  }
  function dutyOptions(sel){
    return '<option value="">Duty type…</option>' + DUTY.map(x => '<option' + (x === sel ? ' selected' : '') + '>' + x + '</option>').join('');
  }

  function bookingForm(f){
    const travel = f.origin === 'travel';
    const isFlat = (f.pricing_type || 'flat') !== 'distance';
    const pricingBlock = isFlat
      ? fin('Flat fare', 'flat_fare', f.flat_fare, { type:'number', ph:'₹', lock:travel })
      : fin('Base fare', 'base_fare', f.base_fare, { type:'number', ph:'₹', lock:travel }) +
        fin('Per-km rate', 'per_km_rate', f.per_km_rate, { type:'number', ph:'₹/km', lock:travel });
    const tripEnd =
      (isFlat ? '' : fin('Distance', 'distance_km', f.distance_km, { type:'number', ph:'km', hint:'(pending till entered)' })) +
      fin('Toll', 'toll', f.toll, { type:'number', ph:'₹' }) +
      fin('Driver cost', 'driver_cost', f.driver_cost, { type:'number', ph:'₹' });

    const amt = carAmount(f), net = carNet(f);
    const preview = '<div class="tt-cbsum" id="cb-preview">' +
      '<div><span class="tt-cbsum-k">Amount</span><span class="tt-cbsum-v" id="cb-amount">' + (amt == null ? 'Pending' : money(amt)) + '</span></div>' +
      '<div><span class="tt-cbsum-k">Net</span><span class="tt-cbsum-v" id="cb-net">' + (net == null ? 'Pending' : money(net)) + '</span></div></div>';

    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' +
        (f.id ? (travel ? 'Trip details · ' + esc(f.display_id || '') : 'Edit car booking') : 'New car booking') + '</h2>' +
        (travel ? '<span class="tt-type travel">Travel ' + esc(f.display_id || '') + '</span>' : '') + '</div>' +
      (travel ? '<div class="tt-asub" style="margin-bottom:10px;">This booking belongs to a travel booking — core details are set there. You can fill trip-end figures and the driver here. It takes no customer payments.</div>' : '') +
      '<div class="tt-fgrid">' +
        fsel('Car', 'car_id', carOptions(f.car_id, f), travel) +
        fsel('Driver', 'driver_id', driverOptions(f.driver_id, f)) +
        fin('Start date', 'start_date', f.start_date, { type:'date', lock:travel }) +
        fin('End date', 'end_date', f.end_date, { type:'date', lock:travel }) +
        fsel('Duty type', 'duty_type', dutyOptions(f.duty_type), travel) +
        fin('Route', 'route', f.route, { ph:'e.g. NJP → Gangtok', lock:travel }) +
        fin('Vendor', 'vendor_name', f.vendor_name, { ph:'Referral source', lock:travel }) +
        fin('Vendor contact', 'vendor_contact', f.vendor_contact, { lock:travel }) +
        fin('Commission', 'commission', f.commission, { type:'number', ph:'₹', lock:travel }) +
      '</div>' +
      '<div class="tt-group"><h3>Pricing</h3><span class="rule"></span></div>' +
      '<div class="tt-fgrid">' +
        fsel('Pricing type', 'pricing_type', '<option value="flat"' + (isFlat ? ' selected' : '') + '>Flat</option><option value="distance"' + (!isFlat ? ' selected' : '') + '>Distance</option>', travel) +
        pricingBlock +
      '</div>' +
      '<div class="tt-group"><h3>Trip end <span class="tt-hint">— fill after the trip</span></h3><span class="rule"></span></div>' +
      '<div class="tt-fgrid">' + tripEnd + '</div>' +
      preview +
      (f.id ? '' :
        '<div class="tt-group"><h3>Advance <span class="tt-hint">— optional, saved as a payment</span></h3><span class="rule"></span></div>' +
        '<div class="tt-fgrid">' +
          fin('Advance received', 'advance', f.advance, { type:'number', ph:'₹' }) +
          fin('Advance date', 'advance_date', f.advance_date || today(), { type:'date' }) +
        '</div>') +
      '<div class="tt-fgrid" style="margin-top:12px;">' + fin('Remarks', 'remarks', f.remarks, { ph:'Notes' }) + '</div>' +
      '<div class="tt-ferr" id="cb-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="cb-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="cb-save">' + (f.id ? 'Save' : 'Create booking') + '</button></div></div>';
  }

  function cancelPanel(c){
    return '<div class="tt-delpanel">' +
      '<div class="tt-delpanel-hd">Cancel booking ' + esc(c.display_id) + '?</div>' +
      '<div class="tt-asub">It stays on record but drops out of revenue, pending and the split pot. You can restore it later.</div>' +
      '<label class="tt-field" style="max-width:360px;"><span>Reason</span><input type="text" id="cx-reason" placeholder="Why it was cancelled"></label>' +
      '<div class="tt-ferr" id="cx-err"></div>' +
      '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" data-cxcancel="' + c.id + '">Keep booking</button>' +
      '<button class="tt-abtn danger" data-cxok="' + c.id + '">Cancel booking</button></div></div>';
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Car bookings</h1>' +
      '<div class="tt-lede">Standalone car hires and the fleet cars used by travel bookings. Distance trips stay pending until the kilometres are entered.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="cb-add">' + svg(I.plus) + 'New booking</button></div></div>';

    if (state.form) h += bookingForm(state.form);

    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else if (!state.rows.length) h += '<div class="tt-card"><div class="tt-empty">No car bookings yet — create your first above.</div></div>';
    else h += filterBar() + '<div class="tt-card"><div class="tt-plist" id="cb-list"></div></div>';
    main.innerHTML = h;
    wireChrome();
    if (state.rows && state.rows.length && !state.err) renderList();
  }

  // ---------- filters ----------
  const opt = (v, label, sel) => '<option value="' + esc(v) + '"' + (sel === v ? ' selected' : '') + '>' + esc(label) + '</option>';
  function filterBar(){
    const f = state.filters;
    const carMap = {}; state.rows.forEach(c => { if (c.car_id != null && !carMap[c.car_id]) carMap[c.car_id] = [c.make, c.model].filter(Boolean).join(' ') + (c.registration_no ? ' · ' + c.registration_no : ''); });
    const carOpts = '<option value="">All cars</option>' + Object.keys(carMap).map(id => opt(id, carMap[id], f.car)).join('');
    const drvMap = {}; let hasNoDrv = false;
    state.rows.forEach(c => { if (c.driver_id != null) { if (!drvMap[c.driver_id]) drvMap[c.driver_id] = c.driver_name || ('#' + c.driver_id); } else hasNoDrv = true; });
    const drvOpts = '<option value="">All drivers</option>' + (hasNoDrv ? opt('none', 'No driver', f.driver) : '') + Object.keys(drvMap).map(id => opt(id, drvMap[id], f.driver)).join('');
    const dutyOpts = '<option value="">All duties</option>' + DUTY.map(d => opt(d, d, f.duty)).join('');

    const ctrl = {
      from:    '<label class="tt-field"><span>From date</span><input type="date" data-flt="from" value="' + esc(f.from) + '"></label>',
      to:      '<label class="tt-field"><span>To date</span><input type="date" data-flt="to" value="' + esc(f.to) + '"></label>',
      status:  '<label class="tt-field"><span>Status</span><select data-flt="status"><option value="">All status</option>' + opt('active', 'Active', f.status) + opt('cancelled', 'Cancelled', f.status) + opt('pending', 'Amount pending', f.status) + '</select></label>',
      duty:    '<label class="tt-field"><span>Duty</span><select data-flt="duty">' + dutyOpts + '</select></label>',
      q:       '<label class="tt-field tt-fltwide"><span>Search</span><input type="text" data-flt="q" value="' + esc(f.q) + '" placeholder="ID, reg, driver, route, vendor…"></label>',
      car:     '<label class="tt-field"><span>Car</span><select data-flt="car">' + carOpts + '</select></label>',
      driver:  '<label class="tt-field"><span>Driver</span><select data-flt="driver">' + drvOpts + '</select></label>',
      pricing: '<label class="tt-field"><span>Pricing</span><select data-flt="pricing"><option value="">All pricing</option>' + opt('flat', 'Flat', f.pricing) + opt('distance', 'Distance', f.pricing) + '</select></label>',
      origin:  '<label class="tt-field"><span>Type</span><select data-flt="origin"><option value="">All types</option>' + opt('standalone', 'Standalone', f.origin) + opt('travel', 'Travel-linked', f.origin) + '</select></label>',
    };
    const hiddenActive = ['q', 'car', 'driver', 'pricing', 'origin'].filter(k => f[k]).length;
    const anyActive = Object.values(f).some(Boolean);
    // one wrapping line: always date range + status + duty; the rest flow in when expanded
    let items = ctrl.from + ctrl.to + ctrl.status + ctrl.duty;
    if (state.expanded) items += ctrl.q + ctrl.car + ctrl.driver + ctrl.pricing + ctrl.origin;
    items += '<button class="tt-abtn soft tt-fmorebtn" id="cb-expand">' + (state.expanded ? 'Fewer filters' : 'More filters' + (hiddenActive ? ' (' + hiddenActive + ')' : '')) + '</button>';
    items += '<button class="tt-abtn soft tt-fmorebtn" id="cb-clear"' + (anyActive ? '' : ' disabled') + '>Reset filters</button>';
    return '<div class="tt-cbfilters">' +
      '<div class="tt-fhdr">Filters <span class="tt-asub" id="cb-count"></span></div>' +
      '<div class="tt-fbar">' + items + '</div></div>';
  }
  function matches(c){
    const f = state.filters;
    if (f.q){ const hay = [c.display_id, c.registration_no, c.make, c.model, c.driver_name, c.route, c.vendor_name, c.remarks, c.cancel_reason].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false; }
    if (f.car && String(c.car_id) !== f.car) return false;
    if (f.driver){ if (f.driver === 'none'){ if (c.driver_id != null) return false; } else if (String(c.driver_id) !== f.driver) return false; }
    if (f.duty && c.duty_type !== f.duty) return false;
    if (f.origin && c.origin !== f.origin) return false;
    if (f.pricing && (c.pricing_type || 'flat') !== f.pricing) return false;
    if (f.status === 'active' && c.cancelled) return false;
    if (f.status === 'cancelled' && !c.cancelled) return false;
    if (f.status === 'pending' && carAmount(c) != null) return false;
    if (f.from || f.to){
      const s = (c.start_date || c.end_date), e = (c.end_date || c.start_date);
      if (!s && !e) return false;                       // undated can't match a date window
      if (f.from && (e || s) < f.from) return false;    // ends before the window
      if (f.to && (s || e) > f.to) return false;        // starts after the window
    }
    return true;
  }
  function rowHtml(c){
    const travel = c.origin === 'travel';
    const cancelled = !!c.cancelled;
    const amt = carAmount(c), net = carNet(c);
    const trip = c.route && c.route !== c.duty_type ? [c.duty_type, c.route].filter(Boolean).join(' · ') : '';
    const money2 = amt == null
      ? '<div class="tt-cbamt-v pend">Pending</div>'
      : '<div class="tt-cbamt-v">' + money(amt) + '</div>' +
        (net == null || net === amt ? '' : '<div class="tt-cbamt-net">net ' + money(net) + '</div>');
    let actBtns = '<button class="tt-abtn soft" data-edit="' + c.id + '">' + (travel ? 'Trip details' : 'Edit') + '</button>';
    if (!travel) actBtns += cancelled
      ? '<button class="tt-abtn soft" data-restore="' + c.id + '">Restore</button>'
      : '<button class="tt-abtn danger" data-cancel="' + c.id + '">Cancel</button>';
    return '<div class="tt-prow' + (cancelled ? ' tt-row-off' : '') + '">' +
        '<div class="tt-prow-main">' +
          '<div class="tt-who">' + esc([c.make, c.model].filter(Boolean).join(' ') || 'Car booking') +
            ' <span class="tt-type ' + (travel ? 'travel' : 'car') + '">' + (travel ? 'Travel ' + esc(c.display_id) : esc(c.display_id)) + '</span>' +
            (cancelled ? ' <span class="tt-badge done">Cancelled</span>' : '') + '</div>' +
          '<div class="tt-prow-sub">' + esc(c.registration_no || '—') + ' · ' + esc(c.driver_name || 'No driver') + ' · ' + esc(fmtRange(c.start_date, c.end_date)) +
            (trip ? ' · ' + esc(trip) : '') + '</div>' +
          (cancelled && c.cancel_reason ? '<div class="tt-prow-sub">Reason: ' + esc(c.cancel_reason) + '</div>' : '') + '</div>' +
      '<div class="tt-prow-side">' +
        '<div class="tt-cbamt' + (cancelled ? ' off' : '') + '">' + money2 + '</div>' +
        '<div class="tt-prow-acts">' + actBtns + '</div></div></div>' +
      (state.cancelId === c.id ? cancelPanel(c) : '');
  }
  function renderList(){
    const list = main.querySelector('#cb-list'); if (!list) return;
    const rows = state.rows.filter(matches);
    const cnt = main.querySelector('#cb-count'); if (cnt) cnt.textContent = '(' + rows.length + ' of ' + state.rows.length + (state.rows.length === 1 ? ' booking' : ' bookings') + ')';
    list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<div class="tt-empty">No bookings match these filters.</div>';
    wireRows();
  }

  // ---------- wiring ----------
  function readForm(){
    const o = {};
    main.querySelectorAll('[data-f]').forEach(i => { o[i.getAttribute('data-f')] = i.value; });
    return o;
  }
  function syncForm(){ if (state.form) Object.assign(state.form, readForm()); }
  function updatePreview(){
    const f = Object.assign({}, state.form, readForm());
    const amt = carAmount(f), net = carNet(f);
    const a = main.querySelector('#cb-amount'), n = main.querySelector('#cb-net');
    if (a) a.textContent = amt == null ? 'Pending' : money(amt);
    if (n) n.textContent = net == null ? 'Pending' : money(net);
  }

  // chrome = header + form + filter bar (rebuilt only on a full render, so the
  // filter controls keep focus/caret while the list re-renders beneath them)
  function wireChrome(){
    const q = (s) => main.querySelector(s);
    const add = q('#cb-add'); if (add) add.addEventListener('click', () => { state.form = { pricing_type:'flat', origin:'standalone' }; render(); });
    const cancel = q('#cb-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#cb-save'); if (save) save.addEventListener('click', doSave);
    const pt = q('[data-f="pricing_type"]'); if (pt) pt.addEventListener('change', () => { syncForm(); state.form.pricing_type = pt.value; render(); });
    main.querySelectorAll('.tt-card [data-f]').forEach(i => i.addEventListener('input', updatePreview));
    // filters: text filters live-update (keeps focus), selects/dates on change
    main.querySelectorAll('[data-flt]').forEach(el => {
      const ev = (el.tagName === 'SELECT' || el.type === 'date') ? 'change' : 'input';
      el.addEventListener(ev, () => {
        state.filters[el.getAttribute('data-flt')] = el.value;
        const clr = q('#cb-clear'); if (clr) clr.disabled = !Object.values(state.filters).some(Boolean);
        renderList();
      });
    });
    const clr = q('#cb-clear'); if (clr) clr.addEventListener('click', () => { state.filters = emptyFilters(); render(); });
    const exp = q('#cb-expand'); if (exp) exp.addEventListener('click', () => { state.expanded = !state.expanded; render(); });
  }
  // row actions — re-wired every time the list re-renders
  function wireRows(){
    main.querySelectorAll('#cb-list [data-edit]').forEach(b => b.addEventListener('click', () => {
      const c = state.rows.find(x => String(x.id) === b.getAttribute('data-edit'));
      state.form = Object.assign({}, c); state.cancelId = null; render();
    }));
    main.querySelectorAll('#cb-list [data-cancel]').forEach(b => b.addEventListener('click', () => { state.cancelId = Number(b.getAttribute('data-cancel')); renderList(); }));
    main.querySelectorAll('#cb-list [data-cxcancel]').forEach(b => b.addEventListener('click', () => { state.cancelId = null; renderList(); }));
    main.querySelectorAll('#cb-list [data-cxok]').forEach(b => b.addEventListener('click', () => doCancel(Number(b.getAttribute('data-cxok')), b)));
    main.querySelectorAll('#cb-list [data-restore]').forEach(b => b.addEventListener('click', () => doRestore(Number(b.getAttribute('data-restore')), b)));
  }

  function doCancel(id, btn){
    const reason = ((main.querySelector('#cx-reason') || {}).value || '').trim();
    const err = main.querySelector('#cx-err'); if (err) err.textContent = '';
    if (!reason) { if (err) err.textContent = 'Please enter cancellation reason'; return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Cancelling…'; }
    patch('car-bookings/' + id, { cancelled: 1, cancelled_at: nowTs(), cancel_reason: reason })
      .then(() => { state.cancelId = null; load(); })
      .catch(e => { if (err) err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not cancel';
        if (btn) { btn.disabled = false; btn.textContent = 'Cancel booking'; } });
  }

  function doRestore(id, btn){
    if (btn) { btn.disabled = true; btn.textContent = 'Restoring…'; }
    patch('car-bookings/' + id, { cancelled: 0, cancelled_at: null, cancel_reason: null }).then(load).catch(load);
  }

  function doSave(){
    syncForm();
    const f = state.form, err = main.querySelector('#cb-ferr'); err.textContent = '';
    const travel = f.origin === 'travel';
    if (!travel && !f.car_id) { err.textContent = 'Pick a car.'; return; }
    const flat = (f.pricing_type || 'flat') !== 'distance';
    if (!travel) {
      if (flat && num(f.flat_fare) == null) { err.textContent = 'Enter the flat fare.'; return; }
      if (!flat && num(f.per_km_rate) == null) { err.textContent = 'Enter the per-km rate.'; return; }
    }
    // build payload: full for standalone, trip-end only for travel-origin rows
    let payload;
    if (travel) {
      payload = { driver_id: num(f.driver_id), distance_km: num(f.distance_km), toll: num(f.toll), driver_cost: num(f.driver_cost), remarks: (f.remarks || '').trim() || null };
    } else {
      payload = {
        car_id: num(f.car_id), driver_id: num(f.driver_id),
        start_date: f.start_date || null, end_date: f.end_date || null,
        duty_type: f.duty_type || null, route: (f.route || '').trim() || null,
        vendor_name: (f.vendor_name || '').trim() || null, vendor_contact: (f.vendor_contact || '').trim() || null,
        commission: num(f.commission) || 0, pricing_type: flat ? 'flat' : 'distance',
        flat_fare: flat ? num(f.flat_fare) : null,
        base_fare: flat ? null : (num(f.base_fare) || 0), per_km_rate: flat ? null : num(f.per_km_rate),
        distance_km: flat ? null : num(f.distance_km),
        toll: num(f.toll) || 0, driver_cost: num(f.driver_cost) || 0,
        remarks: (f.remarks || '').trim() || null,
      };
    }
    const id = f.id, btn = main.querySelector('#cb-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    const adv = num(f.advance);
    const finish = () => { state.form = null; load(); };
    const fail = (e) => { err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
      if (btn) { btn.disabled = false; btn.textContent = id ? 'Save' : 'Create booking'; } };
    if (id) { patch('car-bookings/' + id, payload).then(finish).catch(fail); return; }
    // new booking: create it, then (optionally) record the advance as a payment
    post('car-bookings', payload)
      .then(res => (adv && adv > 0)
        ? post('payments', { car_booking_id: res.data.id, amount: adv, received_on: f.advance_date || today(), note: 'Advance' })
        : null)
      .then(finish).catch(fail);
  }

  load();
}
