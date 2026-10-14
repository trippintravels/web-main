// Expenses screen — a cost is either a Car expense (reduces the car pot) or a
// Travel/agency expense (reduces the travel pot); the category lives on the
// expense, not on individual line items. Each is paid by a partner (drives their
// reimbursement). All straightforward CRUD against /admin/expenses.
import { get, post, patch, del } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const num = (v) => { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const today = () => new Date().toISOString().slice(0, 10);
const REASONS = ['Tax','Insurance','Service','VLTD Recharge','Oil Refill','EMI','Miscellaneous'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthLabel = (m) => { const [y, mo] = m.split('-'); return MONTHS[Number(mo) - 1] + ' ' + y; };
const CATS = { car: 'Car', agency: 'Travel' };     // stored value → label (agency = travel pot)
const catLabel = (c) => CATS[c] || c;

export function renderExpenses(main){
  const state = { rows: null, users: [], err: null, form: null, confirmDel: null,
                  filters: { q:'', category:'', paid_by:'', month:'' } };

  function load(){
    state.rows = null; state.err = null; render();
    Promise.all([get('expenses'), get('users')])
      .then(([e, u]) => { state.rows = e.data; state.users = u.data; render(); })
      .catch(er => { state.err = er.message || 'Could not load'; render(); });
  }
  const userName = (id) => { const u = state.users.find(x => x.id === id); return u ? u.name : ('#' + id); };

  // ---------- form ----------
  const opt = (v, label, sel) => '<option value="' + esc(v) + '"' + (String(sel) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>';
  function payerOptions(sel){
    const list = state.users.filter(u => u.active || String(u.id) === String(sel));
    return '<option value="">Select partner…</option>' + list.map(u => opt(u.id, u.name, sel)).join('');
  }
  function expenseForm(f){
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' + (f.id ? 'Edit expense' : 'Add expense') + '</h2></div>' +
      '<div class="tt-fgrid">' +
        '<label class="tt-field"><span>Date</span><input type="date" data-f="date" value="' + esc(f.date || today()) + '"></label>' +
        '<label class="tt-field"><span>Amount</span><input type="number" min="0" step="1" data-f="amount" value="' + esc(f.amount == null ? '' : f.amount) + '" placeholder="₹"></label>' +
        '<label class="tt-field"><span>Category</span><select data-f="category"><option value="car"' + (f.category !== 'agency' ? ' selected' : '') + '>Car (car pot)</option><option value="agency"' + (f.category === 'agency' ? ' selected' : '') + '>Travel (travel pot)</option></select></label>' +
        '<label class="tt-field"><span>Reason</span><select data-f="reason"><option value="">— none —</option>' + REASONS.map(r => opt(r, r, f.reason)).join('') + '</select></label>' +
        '<label class="tt-field"><span>Paid by</span><select data-f="paid_by_user_id">' + payerOptions(f.paid_by_user_id) + '</select></label>' +
        '<label class="tt-field"><span>Remarks</span><input type="text" data-f="remarks" value="' + esc(f.remarks || '') + '" placeholder="Notes"></label>' +
      '</div>' +
      '<div class="tt-exnote">' + svg(I.doc, 'tt-exnote-ic') + '<span>Record only overhead/operational costs here (tax, insurance, service, EMI, fuel…). Don’t re-enter a booking’s own cost-except-car, commission, toll or driver cost — those are already deducted inside that booking’s net.</span></div>' +
      '<div class="tt-ferr" id="ex-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="ex-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="ex-save">' + (f.id ? 'Save' : 'Add expense') + '</button></div></div>';
  }

  // ---------- filters + list ----------
  function matches(e){
    const f = state.filters;
    if (f.category && e.category !== f.category) return false;
    if (f.paid_by && String(e.paid_by_user_id) !== f.paid_by) return false;
    if (f.month && !String(e.date || '').startsWith(f.month)) return false;
    if (f.q){ const hay = [e.reason, e.remarks, e.paid_by_name || userName(e.paid_by_user_id), e.date, e.amount, catLabel(e.category)].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false; }
    return true;
  }
  function filterBar(){
    const f = state.filters;
    const payers = {}; (state.rows || []).forEach(e => { if (e.paid_by_user_id != null && !payers[e.paid_by_user_id]) payers[e.paid_by_user_id] = e.paid_by_name || userName(e.paid_by_user_id); });
    const payerOpts = '<option value="">All partners</option>' + Object.keys(payers).map(id => opt(id, payers[id], f.paid_by)).join('');
    const months = [...new Set((state.rows || []).map(e => String(e.date || '').slice(0, 7)).filter(m => /^\d{4}-\d{2}$/.test(m)))].sort().reverse();
    const monthOpts = '<option value="">All months</option>' + months.map(m => opt(m, monthLabel(m), f.month)).join('');
    const anyActive = Object.values(f).some(Boolean);
    const items =
      '<label class="tt-field"><span>Category</span><select data-flt="category"><option value="">All</option>' + opt('car','Car',f.category) + opt('agency','Travel',f.category) + '</select></label>' +
      '<label class="tt-field"><span>Paid by</span><select data-flt="paid_by">' + payerOpts + '</select></label>' +
      '<label class="tt-field"><span>Month</span><select data-flt="month">' + monthOpts + '</select></label>' +
      '<label class="tt-field tt-fltwide"><span>Search</span><input type="text" data-flt="q" value="' + esc(f.q) + '" placeholder="reason, partner, remarks…"></label>' +
      '<button class="tt-abtn soft tt-fmorebtn" id="ex-clear"' + (anyActive ? '' : ' disabled') + '>Reset filters</button>';
    return '<div class="tt-cbfilters"><div class="tt-fhdr">Filters <span class="tt-asub" id="ex-count"></span></div><div class="tt-fbar">' + items + '</div></div>';
  }
  function rowHtml(e){
    const acts = state.confirmDel === e.id
      ? '<span class="tt-asub" style="align-self:center;">Delete?</span><button class="tt-abtn soft" data-dcancel="' + e.id + '">No</button><button class="tt-abtn danger" data-dok="' + e.id + '">Yes</button>'
      : '<button class="tt-abtn soft" data-edit="' + e.id + '">Edit</button><button class="tt-abtn danger" data-del="' + e.id + '">Delete</button>';
    return '<div class="tt-prow">' +
        '<div class="tt-prow-main"><div class="tt-who">' + money(e.amount) +
          ' <span class="tt-type ' + (e.category === 'agency' ? 'travel' : 'car') + '">' + esc(catLabel(e.category)) + '</span></div>' +
          '<div class="tt-prow-sub">' + esc(e.date || '') + (e.reason ? ' · ' + esc(e.reason) : '') + ' · paid by ' + esc(e.paid_by_name || userName(e.paid_by_user_id)) + '</div>' +
          (e.remarks ? '<div class="tt-prow-sub">' + esc(e.remarks) + '</div>' : '') + '</div>' +
        '<div class="tt-prow-side"><div class="tt-prow-acts">' + acts + '</div></div></div>';
  }
  function renderList(){
    const list = main.querySelector('#ex-list'); if (!list) return;
    const rows = state.rows.filter(matches);
    const car = rows.filter(e => e.category !== 'agency').reduce((s, e) => s + (e.amount||0), 0);
    const agency = rows.filter(e => e.category === 'agency').reduce((s, e) => s + (e.amount||0), 0);
    const cnt = main.querySelector('#ex-count'); if (cnt) cnt.textContent = '(' + rows.length + ' of ' + state.rows.length + (state.rows.length === 1 ? ' expense' : ' expenses') + ')';
    const tot = main.querySelector('#ex-totals'); if (tot) tot.innerHTML = 'Car pot <b>−' + money(car) + '</b> · Travel pot <b>−' + money(agency) + '</b>';
    list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<div class="tt-empty">No expenses' + (Object.values(state.filters).some(Boolean) ? ' match these filters' : ' yet') + '.</div>';
    wireRows();
  }

  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Expenses</h1>' +
      '<div class="tt-lede">Car or travel costs, each paid by a partner. Car expenses reduce the car pot, travel expenses the travel pot.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="ex-add">' + svg(I.plus) + 'Add expense</button></div></div>';
    if (state.form) h += expenseForm(state.form);
    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else {
      h += filterBar() + '<div class="tt-exsum" id="ex-totals"></div>' +
        '<div class="tt-card"><div class="tt-plist" id="ex-list"></div></div>';
    }
    main.innerHTML = h;
    wireChrome();
    if (state.rows && !state.err) renderList();
  }

  // ---------- wiring ----------
  function readForm(){ const o = {}; main.querySelectorAll('[data-f]').forEach(i => o[i.getAttribute('data-f')] = i.value); return o; }
  function wireChrome(){
    const q = (s) => main.querySelector(s);
    const add = q('#ex-add'); if (add) add.addEventListener('click', () => { state.form = { date: today(), category:'car' }; render(); });
    const cancel = q('#ex-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#ex-save'); if (save) save.addEventListener('click', doSave);
    main.querySelectorAll('[data-flt]').forEach(el => {
      const ev = (el.tagName === 'SELECT' || el.type === 'month') ? 'change' : 'input';
      el.addEventListener(ev, () => { state.filters[el.getAttribute('data-flt')] = el.value; const c = q('#ex-clear'); if (c) c.disabled = !Object.values(state.filters).some(Boolean); renderList(); });
    });
    const clr = q('#ex-clear'); if (clr) clr.addEventListener('click', () => { state.filters = { q:'', category:'', paid_by:'', month:'' }; render(); });
  }
  function wireRows(){
    main.querySelectorAll('#ex-list [data-edit]').forEach(b => b.addEventListener('click', () => {
      const e = state.rows.find(x => String(x.id) === b.getAttribute('data-edit'));
      state.form = { id: e.id, date: e.date || '', amount: e.amount ?? '', category: e.category, reason: e.reason || '', paid_by_user_id: e.paid_by_user_id || '', remarks: e.remarks || '' };
      state.confirmDel = null; render();
    }));
    main.querySelectorAll('#ex-list [data-del]').forEach(b => b.addEventListener('click', () => { state.confirmDel = Number(b.getAttribute('data-del')); renderList(); }));
    main.querySelectorAll('#ex-list [data-dcancel]').forEach(b => b.addEventListener('click', () => { state.confirmDel = null; renderList(); }));
    main.querySelectorAll('#ex-list [data-dok]').forEach(b => b.addEventListener('click', () => doDelete(Number(b.getAttribute('data-dok')), b)));
  }

  function doSave(){
    const o = readForm(), err = main.querySelector('#ex-ferr'); err.textContent = '';
    if (!o.date) { err.textContent = 'Pick a date.'; return; }
    if (num(o.amount) == null || num(o.amount) <= 0) { err.textContent = 'Enter an amount greater than zero.'; return; }
    if (!o.paid_by_user_id) { err.textContent = 'Pick the partner who paid.'; return; }
    const payload = { date: o.date, amount: num(o.amount), category: o.category === 'agency' ? 'agency' : 'car',
      reason: o.reason || null, paid_by_user_id: Number(o.paid_by_user_id), remarks: (o.remarks || '').trim() || null };
    const id = state.form.id, btn = main.querySelector('#ex-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    (id ? patch('expenses/' + id, payload) : post('expenses', payload))
      .then(() => { state.form = null; load(); })
      .catch(e => { err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
        if (btn) { btn.disabled = false; btn.textContent = id ? 'Save' : 'Add expense'; } });
  }
  function doDelete(id, btn){
    if (btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }
    del('expenses/' + id).then(() => { state.confirmDel = null; load(); }).catch(() => { state.confirmDel = null; load(); });
  }

  load();
}
