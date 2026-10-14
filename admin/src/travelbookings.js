// Travel bookings screen — the agency's package bookings. Each has customer +
// trip details, any number of Hotels Contact rows, money (gross booking_amount,
// FE net = booking_amount − cost_except_car − linked-car amount − commission),
// and optionally a fleet car (car_included → a linked car_bookings row, origin
// 'travel', sharing the parent T#). Net/pending/amounts are FE-computed.
// Cancelling a travel booking cascades the cancel to its linked car booking.
import { get, post, patch } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const num = (v) => { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const nowTs = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const today = () => new Date().toISOString().slice(0, 10);
const fmtRange = (a, b) => [a, b].filter(Boolean).join(' → ') || 'Dates TBD';
const DUTY = ['Local','Dooars','Hills','Airport','NJP','Others'];
const emptyFilters = () => ({ q:'', status:'', car:'', from:'', to:'' });

// Two-pot breakdown. car_cost is the entered transfer price travel pays its car
// pool (beside cost_except_car); the car's flat fare is locked to car_cost.
//   travel_gross = gross − car_cost
//   travel_net   = gross − cost_except_car − car_cost − commission   (→ travel pot)
//   car_gross    = car_cost
//   car_net      = car_cost − toll − driver_cost                     (→ car pot)
function figures(gross, costExceptCar, carCost, commission, car){
  const hasCar = !!car;
  const travelGross = gross - carCost;
  const travelNet = gross - costExceptCar - carCost - commission;
  const carGross = hasCar ? carCost : null;
  const carNet = hasCar ? carCost - (num(car.toll)||0) - (num(car.driver_cost)||0) : null;
  return { gross, hasCar, carCost, travelGross, travelNet, carGross, carNet };
}

export function renderTravelBookings(main){
  const state = { rows: null, carb: [], cars: [], drivers: [], payments: [], err: null,
                  form: null, cancelId: null, filters: emptyFilters(), expanded: false };
  let hid = 0;  // transient hotel-row ids

  function load(){
    state.rows = null; state.err = null; render();
    Promise.all([get('travel-bookings'), get('car-bookings'), get('cars'), get('drivers'), get('payments')])
      .then(([t, cb, c, d, p]) => { state.rows = t.data; state.carb = cb.data; state.cars = c.data; state.drivers = d.data; state.payments = p.data; render(); })
      .catch(e => { state.err = e.message || 'Could not load'; render(); });
  }

  // ---- derived maps ----
  const linkedCar = (tid) => state.carb.find(c => c.origin === 'travel' && c.travel_booking_id === tid) || null;
  const paidFor = (tid) => state.payments.reduce((s, p) => s + (p.travel_booking_id === tid ? (p.amount || 0) : 0), 0);
  const grossOf = (b) => num(b.booking_amount) || 0;
  // a travel-linked car's fare is locked to the booking's car_cost (flat)
  const travelCar = (lc, carCost) => lc ? Object.assign({}, lc, { pricing_type:'flat', flat_fare: carCost }) : null;
  const figsOf = (b) => figures(grossOf(b), num(b.cost_except_car)||0, num(b.car_cost)||0, num(b.commission)||0, travelCar(linkedCar(b.id), num(b.car_cost)||0));

  // ---------- form ----------
  const opt = (v, label, sel) => '<option value="' + esc(v) + '"' + (String(sel) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>';
  function fin(label, name, val, { type='text', ph='', attr='f', hint='' } = {}){
    return '<label class="tt-field"><span>' + label + (hint ? ' <span class="tt-hint">' + hint + '</span>' : '') + '</span>' +
      '<input type="' + type + '" data-' + attr + '="' + name + '" value="' + esc(val == null ? '' : val) + '"' +
      (type === 'number' ? ' min="0" step="1"' : '') + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></label>';
  }
  function carSelect(sel){
    const list = state.cars.filter(c => c.active || String(c.id) === String(sel));
    return '<label class="tt-field"><span>Car</span><select data-cf="car_id"><option value="">Select car…</option>' +
      list.map(c => opt(c.id, [c.make, c.model].filter(Boolean).join(' ') + (c.registration_no ? ' · ' + c.registration_no : ''), sel)).join('') + '</select></label>';
  }
  function driverSelect(sel){
    const list = state.drivers.filter(d => d.active || String(d.id) === String(sel));
    return '<label class="tt-field"><span>Driver</span><select data-cf="driver_id"><option value="">No driver</option>' +
      list.map(d => opt(d.id, d.name, sel)).join('') + '</select></label>';
  }
  function hotelRows(){
    const rows = (state.form.hotels || []).map(h =>
      '<div class="tt-hotelrow" data-hrow="' + h._id + '">' +
        '<input type="text" data-hf="' + h._id + ':hotel_name" value="' + esc(h.hotel_name || '') + '" placeholder="Hotel name">' +
        '<input type="text" data-hf="' + h._id + ':location" value="' + esc(h.location || '') + '" placeholder="Location">' +
        '<input type="text" data-hf="' + h._id + ':contact" value="' + esc(h.contact || '') + '" placeholder="Contact">' +
        '<button class="tt-dbtn danger" data-hdel="' + h._id + '" title="Remove" aria-label="Remove">' + svg(I.trash) + '</button>' +
      '</div>').join('');
    return (rows || '<div class="tt-asub" style="padding:6px 0;">No hotels added.</div>') +
      '<div class="tt-factions" style="justify-content:flex-start;margin-top:4px;"><button class="tt-btn ghost" id="tb-addhotel">' + svg(I.plus) + 'Add hotel</button></div>';
  }
  function carBlock(f){
    const c = f.car || {};
    // pricing is locked to Flat and the fare mirrors the entered Car cost
    return '<div class="tt-fgrid">' +
        carSelect(c.car_id) + driverSelect(c.driver_id) +
        fin('Car start', 'start_date', c.start_date, { type:'date', attr:'cf' }) +
        fin('Car end', 'end_date', c.end_date, { type:'date', attr:'cf' }) +
        '<label class="tt-field"><span>Duty type</span><select data-cf="duty_type"><option value="">Duty type…</option>' + DUTY.map(x => opt(x, x, c.duty_type)).join('') + '</select></label>' +
        fin('Route', 'route', c.route, { ph:'e.g. NJP → Gangtok', attr:'cf' }) +
        '<label class="tt-field"><span>Pricing</span><select data-cf="pricing_type" disabled><option value="flat" selected>Flat</option></select></label>' +
        '<label class="tt-field"><span>Flat fare <span class="tt-hint">(= car cost)</span></span><input type="number" data-cf="flat_fare" value="' + esc(num(f.car_cost) || 0) + '" disabled></label>' +
        fin('Toll', 'toll', c.toll, { type:'number', ph:'₹', attr:'cf' }) +
        fin('Driver cost', 'driver_cost', c.driver_cost, { type:'number', ph:'₹', attr:'cf' }) +
      '</div>';
  }
  function bookingForm(f){
    const fig = figures(grossOf(f), num(f.cost_except_car)||0, num(f.car_cost)||0, num(f.commission)||0, f.carIncluded ? travelCar(f.car, num(f.car_cost)||0) : null);
    const mv = (v) => v == null ? 'Pending' : money(v);
    const item = (k, id, v, cls) => '<div><span class="tt-cbsum-k">' + k + '</span><span class="tt-cbsum-v' + (cls ? ' ' + cls : '') + '" id="' + id + '">' + v + '</span></div>';
    const preview = '<div class="tt-cbsum" id="tb-preview">' +
      item('Gross', 'tb-gross', money(fig.gross)) +
      item('Travel gross', 'tb-tgross', money(fig.travelGross)) +
      item('Travel net', 'tb-tnet', mv(fig.travelNet), 'pot') +
      (fig.hasCar ? item('Car gross', 'tb-cgross', mv(fig.carGross)) : '') +
      (fig.hasCar ? item('Car net', 'tb-cnet', mv(fig.carNet), 'pot') : '') + '</div>';
    const lockCar = !!f.id;  // car can't be added/removed on edit, only its details edited
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' + (f.id ? 'Edit travel booking' + (f.display_id ? ' · ' + esc(f.display_id) : '') : 'New travel booking') + '</h2></div>' +
      '<div class="tt-fgrid">' +
        fin('Customer name', 'customer_name', f.customer_name, { ph:'Traveller' }) +
        fin('Customer phone', 'customer_phone', f.customer_phone) +
        fin('Start date', 'start_date', f.start_date, { type:'date' }) +
        fin('End date', 'end_date', f.end_date, { type:'date' }) +
        fin('Pax', 'pax', f.pax, { type:'number' }) +
        fin('Itinerary', 'itinerary', f.itinerary, { ph:'e.g. Darjeeling–Sikkim' }) +
        fin('Add-ons', 'addons', f.addons) +
        fin('Exclusions', 'exclusions', f.exclusions) +
      '</div>' +
      '<div class="tt-group"><h3>Hotels contact</h3><span class="rule"></span></div>' + hotelRows() +
      '<div class="tt-group"><h3>Money</h3><span class="rule"></span></div>' +
      '<div class="tt-fgrid">' +
        fin('Booking amount', 'booking_amount', f.booking_amount, { type:'number', ph:'₹ gross' }) +
        fin('Cost except car', 'cost_except_car', f.cost_except_car, { type:'number', ph:'₹' }) +
        fin('Car cost', 'car_cost', f.car_cost, { type:'number', ph:'₹ to car pool', hint:'(paid to car pot)' }) +
        fin('Commission', 'commission', f.commission, { type:'number', ph:'₹' }) +
        fin('Vendor', 'vendor_name', f.vendor_name, { ph:'Referral source' }) +
        fin('Vendor contact', 'vendor_contact', f.vendor_contact) +
        fin('Comments', 'comments', f.comments) +
      '</div>' +
      '<div class="tt-group"><h3>Fleet car</h3><span class="rule"></span></div>' +
      '<label class="tt-check" style="margin:2px 0 10px;"><input type="checkbox" id="tb-carincl"' + (f.carIncluded ? ' checked' : '') + (lockCar ? ' disabled' : '') + '>' +
        'This booking uses one of our fleet cars' + (lockCar ? ' <span class="tt-hint">(set at creation)</span>' : '') + '</label>' +
      (f.carIncluded ? carBlock(f) : '') +
      preview +
      (f.id ? '' :
        '<div class="tt-group"><h3>Advance <span class="tt-hint">— optional total, saved as a payment</span></h3><span class="rule"></span></div>' +
        '<div class="tt-fgrid">' +
          fin('Total advance', 'advance', f.advance, { type:'number', ph:'₹' }) +
          fin('Advance date', 'advance_date', f.advance_date || today(), { type:'date' }) +
        '</div>') +
      '<div class="tt-ferr" id="tb-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="tb-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="tb-save">' + (f.id ? 'Save' : 'Create booking') + '</button></div></div>';
  }

  // ---------- filters ----------
  function filterBar(){
    const f = state.filters;
    const carMap = {};
    state.rows.forEach(b => { const c = linkedCar(b.id); if (c && c.car_id != null && !carMap[c.car_id]) carMap[c.car_id] = [c.make, c.model].filter(Boolean).join(' ') + (c.registration_no ? ' · ' + c.registration_no : ''); });
    const carOpts = '<option value="">Any car</option>' + opt('none', 'No fleet car', f.car) + Object.keys(carMap).map(id => opt(id, carMap[id], f.car)).join('');
    const ctrl = {
      from:   '<label class="tt-field"><span>From date</span><input type="date" data-flt="from" value="' + esc(f.from) + '"></label>',
      to:     '<label class="tt-field"><span>To date</span><input type="date" data-flt="to" value="' + esc(f.to) + '"></label>',
      status: '<label class="tt-field"><span>Status</span><select data-flt="status"><option value="">All status</option>' + opt('active','Active',f.status) + opt('paid','Paid',f.status) + opt('pending','Pending',f.status) + opt('cancelled','Cancelled',f.status) + '</select></label>',
      q:      '<label class="tt-field tt-fltwide"><span>Search</span><input type="text" data-flt="q" value="' + esc(f.q) + '" placeholder="T#, customer, phone, itinerary, vendor…"></label>',
      car:    '<label class="tt-field"><span>Fleet car</span><select data-flt="car">' + carOpts + '</select></label>',
    };
    const hiddenActive = ['q', 'car'].filter(k => f[k]).length;
    const anyActive = Object.values(f).some(Boolean);
    let items = ctrl.from + ctrl.to + ctrl.status;
    if (state.expanded) items += ctrl.q + ctrl.car;
    items += '<button class="tt-abtn soft tt-fmorebtn" id="tb-expand">' + (state.expanded ? 'Fewer filters' : 'More filters' + (hiddenActive ? ' (' + hiddenActive + ')' : '')) + '</button>';
    items += '<button class="tt-abtn soft tt-fmorebtn" id="tb-clear"' + (anyActive ? '' : ' disabled') + '>Reset filters</button>';
    return '<div class="tt-cbfilters"><div class="tt-fhdr">Filters <span class="tt-asub" id="tb-count"></span></div><div class="tt-fbar">' + items + '</div></div>';
  }
  function matches(b){
    const f = state.filters;
    if (f.q){ const hay = [b.display_id, b.customer_name, b.customer_phone, b.itinerary, b.vendor_name, b.addons, b.exclusions, b.comments, b.cancel_reason].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false; }
    if (f.car){ const c = linkedCar(b.id);
      if (f.car === 'none'){ if (c) return false; } else if (!c || String(c.car_id) !== f.car) return false; }
    if (f.status){
      const pend = grossOf(b) - paidFor(b.id);
      if (f.status === 'active' && b.cancelled) return false;
      if (f.status === 'cancelled' && !b.cancelled) return false;
      if (f.status === 'paid' && (b.cancelled || pend > 0)) return false;
      if (f.status === 'pending' && (b.cancelled || pend <= 0)) return false;
    }
    if (f.from || f.to){
      const s = (b.start_date || b.end_date), e = (b.end_date || b.start_date);
      if (!s && !e) return false;
      if (f.from && (e || s) < f.from) return false;
      if (f.to && (s || e) > f.to) return false;
    }
    return true;
  }

  // ---------- list ----------
  function rowHtml(b){
    const cancelled = !!b.cancelled;
    const gross = grossOf(b), paid = paidFor(b.id), pend = gross - paid;
    const car = linkedCar(b.id);
    const fig = figsOf(b);
    const mv = (v) => v == null ? 'pending' : money(v);
    const payPill = cancelled ? '' : (pend <= 0 ? '<span class="tt-badge ok">Paid</span>' : '<span class="tt-badge wait">' + money(pend) + ' due</span>');
    const money2 = '<div class="tt-cbamt-v">' + money(gross) + '</div>' +
      '<div class="tt-cbamt-net">travel net ' + mv(fig.travelNet) + '</div>' +
      (fig.hasCar ? '<div class="tt-cbamt-net">car net ' + mv(fig.carNet) + '</div>' : '');
    let actBtns = '<button class="tt-abtn soft" data-edit="' + b.id + '">Edit</button>' +
      (cancelled ? '<button class="tt-abtn soft" data-restore="' + b.id + '">Restore</button>'
                 : '<button class="tt-abtn danger" data-cancel="' + b.id + '">Cancel</button>');
    return '<div class="tt-prow' + (cancelled ? ' tt-row-off' : '') + '">' +
        '<div class="tt-prow-main">' +
          '<div class="tt-who">' + esc(b.customer_name || 'Traveller') +
            ' <span class="tt-type travel">' + esc(b.display_id) + '</span>' +
            (car ? ' <span class="tt-type car">Car ' + esc(car.registration_no || '') + '</span>' : '') +
            (cancelled ? ' <span class="tt-badge done">Cancelled</span>' : '') + '</div>' +
          '<div class="tt-prow-sub">' + esc(fmtRange(b.start_date, b.end_date)) + (b.pax ? ' · ' + esc(b.pax) + ' pax' : '') + (b.customer_phone ? ' · ' + esc(b.customer_phone) : '') + '</div>' +
          (b.itinerary ? '<div class="tt-prow-sub">' + esc(b.itinerary) + '</div>' : '') +
          (cancelled && b.cancel_reason ? '<div class="tt-prow-sub">Reason: ' + esc(b.cancel_reason) + '</div>' : '') + '</div>' +
      '<div class="tt-prow-side">' +
        (payPill ? '<div>' + payPill + '</div>' : '') +
        '<div class="tt-cbamt' + (cancelled ? ' off' : '') + '">' + money2 + '</div>' +
        '<div class="tt-prow-acts">' + actBtns + '</div></div></div>' +
      (state.cancelId === b.id ? cancelPanel(b) : '');
  }
  function cancelPanel(b){
    const car = linkedCar(b.id);
    return '<div class="tt-delpanel">' +
      '<div class="tt-delpanel-hd">Cancel booking ' + esc(b.display_id) + '?</div>' +
      '<div class="tt-asub">It stays on record but drops out of revenue, pending and the split pot' + (car ? ', and its linked car booking is cancelled too' : '') + '. You can restore it later.</div>' +
      '<label class="tt-field" style="max-width:360px;"><span>Reason</span><input type="text" id="tbx-reason" placeholder="Why it was cancelled"></label>' +
      '<div class="tt-ferr" id="tbx-err"></div>' +
      '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" data-cxcancel="' + b.id + '">Keep booking</button>' +
      '<button class="tt-abtn danger" data-cxok="' + b.id + '">Cancel booking</button></div></div>';
  }
  function renderList(){
    const list = main.querySelector('#tb-list'); if (!list) return;
    const rows = state.rows.filter(matches);
    const cnt = main.querySelector('#tb-count'); if (cnt) cnt.textContent = '(' + rows.length + ' of ' + state.rows.length + (state.rows.length === 1 ? ' booking' : ' bookings') + ')';
    list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<div class="tt-empty">No bookings match these filters.</div>';
    wireRows();
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Travel bookings</h1>' +
      '<div class="tt-lede">Package bookings — customer, hotels, money and (optionally) a fleet car. Net is after cost-except-car, the car cost and commission.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="tb-add">' + svg(I.plus) + 'New booking</button></div></div>';
    if (state.form) h += bookingForm(state.form);
    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else if (!state.rows.length) h += '<div class="tt-card"><div class="tt-empty">No travel bookings yet — create your first above.</div></div>';
    else h += filterBar() + '<div class="tt-card"><div class="tt-plist" id="tb-list"></div></div>';
    main.innerHTML = h;
    wireChrome();
    if (state.rows && state.rows.length && !state.err) renderList();
  }

  // ---------- form state sync ----------
  function readInto(attr, target){ main.querySelectorAll('[data-' + attr + ']').forEach(i => { target[i.getAttribute('data-' + attr)] = i.value; }); }
  function syncHotels(){ (state.form.hotels || []).forEach(h => ['hotel_name','location','contact'].forEach(fld => { const el = main.querySelector('[data-hf="' + h._id + ':' + fld + '"]'); if (el) h[fld] = el.value; })); }
  function syncForm(){ if (!state.form) return; readInto('f', state.form); if (!state.form.car) state.form.car = {}; readInto('cf', state.form.car); syncHotels(); }
  function updatePreview(){
    const f = Object.assign({}, state.form); readInto('f', f); f.car = Object.assign({}, state.form.car); readInto('cf', f.car);
    const ff = main.querySelector('[data-cf="flat_fare"]'); if (ff) ff.value = num(f.car_cost) || 0;  // keep locked fare = car cost
    const fig = figures(grossOf(f), num(f.cost_except_car)||0, num(f.car_cost)||0, num(f.commission)||0, f.carIncluded ? travelCar(f.car, num(f.car_cost)||0) : null);
    const mv = (v) => v == null ? 'Pending' : money(v);
    const set = (id, v) => { const el = main.querySelector('#' + id); if (el) el.textContent = v; };
    set('tb-gross', money(fig.gross)); set('tb-tgross', money(fig.travelGross)); set('tb-tnet', mv(fig.travelNet));
    set('tb-cgross', mv(fig.carGross)); set('tb-cnet', mv(fig.carNet));
  }

  // ---------- wiring ----------
  function wireChrome(){
    const q = (s) => main.querySelector(s);
    const add = q('#tb-add'); if (add) add.addEventListener('click', () => { state.form = { hotels: [], carIncluded: false, car: { pricing_type:'flat' } }; state.cancelId = null; render(); });
    const cancel = q('#tb-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#tb-save'); if (save) save.addEventListener('click', doSave);
    const addH = q('#tb-addhotel'); if (addH) addH.addEventListener('click', () => { syncForm(); state.form.hotels.push({ _id: ++hid, hotel_name:'', location:'', contact:'' }); render(); });
    main.querySelectorAll('[data-hdel]').forEach(b => b.addEventListener('click', () => { syncForm(); const id = b.getAttribute('data-hdel'); state.form.hotels = state.form.hotels.filter(h => String(h._id) !== id); render(); }));
    const incl = q('#tb-carincl'); if (incl) incl.addEventListener('change', () => { syncForm(); state.form.carIncluded = incl.checked; render(); });
    const pt = q('[data-cf="pricing_type"]'); if (pt) pt.addEventListener('change', () => { syncForm(); state.form.car.pricing_type = pt.value; render(); });
    main.querySelectorAll('.tt-card [data-f], .tt-card [data-cf]').forEach(i => i.addEventListener('input', updatePreview));
    // filters
    main.querySelectorAll('[data-flt]').forEach(el => {
      const ev = (el.tagName === 'SELECT' || el.type === 'date') ? 'change' : 'input';
      el.addEventListener(ev, () => { state.filters[el.getAttribute('data-flt')] = el.value; const clr = q('#tb-clear'); if (clr) clr.disabled = !Object.values(state.filters).some(Boolean); renderList(); });
    });
    const clr = q('#tb-clear'); if (clr) clr.addEventListener('click', () => { state.filters = emptyFilters(); render(); });
    const exp = q('#tb-expand'); if (exp) exp.addEventListener('click', () => { state.expanded = !state.expanded; render(); });
  }
  function wireRows(){
    main.querySelectorAll('#tb-list [data-edit]').forEach(b => b.addEventListener('click', () => openEdit(Number(b.getAttribute('data-edit')))));
    main.querySelectorAll('#tb-list [data-cancel]').forEach(b => b.addEventListener('click', () => { state.cancelId = Number(b.getAttribute('data-cancel')); renderList(); }));
    main.querySelectorAll('#tb-list [data-cxcancel]').forEach(b => b.addEventListener('click', () => { state.cancelId = null; renderList(); }));
    main.querySelectorAll('#tb-list [data-cxok]').forEach(b => b.addEventListener('click', () => doCancel(Number(b.getAttribute('data-cxok')), b)));
    main.querySelectorAll('#tb-list [data-restore]').forEach(b => b.addEventListener('click', () => doRestore(Number(b.getAttribute('data-restore')), b)));
  }

  // ---------- open edit (fetch full booking: hotels + linked car) ----------
  function openEdit(id){
    const list = main.querySelector('#tb-list'); if (list) list.style.opacity = '.5';
    get('travel-bookings/' + id).then(r => {
      const b = r.data, c = b.car_booking;
      state.form = {
        id: b.id, display_id: b.display_id,
        customer_name: b.customer_name || '', customer_phone: b.customer_phone || '',
        start_date: b.start_date || '', end_date: b.end_date || '', pax: b.pax ?? '',
        itinerary: b.itinerary || '', addons: b.addons || '', exclusions: b.exclusions || '',
        booking_amount: b.booking_amount ?? '', cost_except_car: b.cost_except_car ?? '', car_cost: b.car_cost ?? '', commission: b.commission ?? '',
        vendor_name: b.vendor_name || '', vendor_contact: b.vendor_contact || '', comments: b.comments || '',
        hotels: (b.hotels || []).map(h => ({ _id: ++hid, hotel_name: h.hotel_name || '', location: h.location || '', contact: h.contact || '' })),
        carIncluded: !!c, linkedCarId: c ? c.id : null, car: c ? Object.assign({}, c) : { pricing_type:'flat' },
      };
      state.cancelId = null; render();
    }).catch(e => { state.err = e.message || 'Could not open booking'; render(); });
  }

  // travel-linked car is always flat with fare = the booking's car_cost
  function carPayload(c, carCost){
    return {
      car_id: num(c.car_id), driver_id: num(c.driver_id),
      start_date: c.start_date || null, end_date: c.end_date || null,
      duty_type: c.duty_type || null, route: (c.route || '').trim() || null,
      pricing_type: 'flat', flat_fare: carCost, base_fare: null, per_km_rate: null, distance_km: null,
      toll: num(c.toll) || 0, driver_cost: num(c.driver_cost) || 0,
    };
  }
  function doSave(){
    syncForm();
    const f = state.form, err = main.querySelector('#tb-ferr'); err.textContent = '';
    if (!(f.customer_name || '').trim()) { err.textContent = 'Customer name is required.'; return; }
    if (num(f.booking_amount) == null) { err.textContent = 'Enter the booking amount.'; return; }
    if (f.carIncluded){
      if (!num(f.car && f.car.car_id)) { err.textContent = 'Pick the fleet car, or untick “uses a fleet car”.'; return; }
      if (!num(f.car_cost)) { err.textContent = 'Enter the car cost — it sets the car’s flat fare.'; return; }
    }
    const travel = {
      customer_name: f.customer_name.trim(), customer_phone: (f.customer_phone || '').trim() || null,
      start_date: f.start_date || null, end_date: f.end_date || null, pax: num(f.pax),
      itinerary: (f.itinerary || '').trim() || null, addons: (f.addons || '').trim() || null, exclusions: (f.exclusions || '').trim() || null,
      booking_amount: num(f.booking_amount), cost_except_car: num(f.cost_except_car) || 0, car_cost: num(f.car_cost) || 0, commission: num(f.commission) || 0,
      vendor_name: (f.vendor_name || '').trim() || null, vendor_contact: (f.vendor_contact || '').trim() || null,
      comments: (f.comments || '').trim() || null, car_included: f.carIncluded ? 1 : 0,
    };
    const hotels = (f.hotels || []).filter(h => (h.hotel_name || h.location || h.contact)).map(h => ({ hotel_name: (h.hotel_name||'').trim() || null, location: (h.location||'').trim() || null, contact: (h.contact||'').trim() || null }));
    const btn = main.querySelector('#tb-save'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    const done = () => { state.form = null; load(); };
    const fail = (e) => { err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
      if (btn) { btn.disabled = false; btn.textContent = f.id ? 'Save' : 'Create booking'; } };
    if (f.id){
      patch('travel-bookings/' + f.id, Object.assign({}, travel, { hotels }))
        .then(() => (f.carIncluded && f.linkedCarId) ? patch('car-bookings/' + f.linkedCarId, carPayload(f.car, num(f.car_cost)||0)) : null)
        .then(done).catch(fail);
    } else {
      const body = Object.assign({}, travel, { hotels });
      if (f.carIncluded) body.car = carPayload(f.car, num(f.car_cost)||0);
      const adv = num(f.advance);
      post('travel-bookings', body)
        .then(res => (adv && adv > 0)
          ? post('payments', { travel_booking_id: res.data.id, amount: adv, received_on: f.advance_date || today(), note: 'Advance' })
          : null)
        .then(done).catch(fail);
    }
  }

  // ---------- cancel / restore (cascades to linked car booking) ----------
  function doCancel(id, btn){
    const reason = ((main.querySelector('#tbx-reason') || {}).value || '').trim();
    const err = main.querySelector('#tbx-err'); if (err) err.textContent = '';
    if (!reason) { if (err) err.textContent = 'Please enter cancellation reason'; return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Cancelling…'; }
    const car = linkedCar(id);
    patch('travel-bookings/' + id, { cancelled: 1, cancelled_at: nowTs(), cancel_reason: reason })
      .then(() => car ? patch('car-bookings/' + car.id, { cancelled: 1, cancelled_at: nowTs(), cancel_reason: 'Travel booking cancelled' }) : null)
      .then(() => { state.cancelId = null; load(); })
      .catch(e => { if (err) err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not cancel';
        if (btn) { btn.disabled = false; btn.textContent = 'Cancel booking'; } });
  }
  function doRestore(id, btn){
    if (btn) { btn.disabled = true; btn.textContent = 'Restoring…'; }
    const car = linkedCar(id);
    patch('travel-bookings/' + id, { cancelled: 0, cancelled_at: null, cancel_reason: null })
      .then(() => car ? patch('car-bookings/' + car.id, { cancelled: 0, cancelled_at: null, cancel_reason: null }) : null)
      .then(load).catch(load);
  }

  load();
}
