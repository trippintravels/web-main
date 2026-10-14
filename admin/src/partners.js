// Partners screen — the dashboard users AND the revenue-split configuration.
// Partners are the split participants; changing a split writes a new
// effective-dated version (past bookings keep the split in force at their time).
import { get, post, patch } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const today = () => new Date().toISOString().slice(0, 10);

export function renderPartners(main){
  const state = { rows: null, splits: null, err: null, form: null, splitForm: null };

  function load(){
    state.rows = null; state.splits = null; state.err = null; render();
    Promise.all([get('users'), get('split-config')])
      .then(([u, s]) => { state.rows = u.data; state.splits = s.data; render(); })
      .catch(e => { state.err = e.message || 'Could not load'; render(); });
  }

  const activePartners = () => (state.rows || []).filter(u => u.active);
  function latestVersion(stream){
    const vs = (state.splits || []).filter(v => v.stream === stream);
    if (!vs.length) return null;
    vs.sort((a, b) => String(b.effective_from).localeCompare(String(a.effective_from)));
    return vs[0];
  }

  // ---------- partner add/edit ----------
  function field(label, name, val, type){
    return '<label class="tt-field"><span>' + label + '</span><input type="' + type + '" data-f="' + name + '" value="' + esc(val || '') + '"></label>';
  }
  function partnerForm(f){
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' + (f.id ? 'Edit partner' : 'New partner') + '</h2></div>' +
      '<div class="tt-fgrid">' + field('Name','name',f.name,'text') + field('Email','email',f.email,'email') + field('Phone','phone',f.phone,'text') + '</div>' +
      '<div class="tt-ferr" id="p-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="p-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="p-save">' + (f.id ? 'Save changes' : 'Add partner') + '</button></div></div>';
  }

  // ---------- split cards + editor + history ----------
  const streamLabel = (s) => (s === 'travel' ? 'Travel' : 'Car');
  function splitCard(stream, title){
    const v = latestVersion(stream);
    let body;
    if (!v) body = '<div class="tt-asub">No split set yet.</div>';
    else body = '<div class="tt-split-meta">Shared equally among <b>' + v.members.length + '</b> · effective ' + esc(v.effective_from) + '</div>' +
                '<div class="tt-split-names">' + (v.members.map(m => esc(m.name || ('#' + m.user_id))).join(', ') || '—') + '</div>';
    return '<div class="tt-card tt-split"><div class="tt-cardhd"><h2>' + title + '</h2>' +
      '<span class="tt-link" data-splitedit="' + stream + '">Change split</span></div>' + body + '</div>';
  }
  function splitForm(stream){
    const v = latestVersion(stream);
    const cur = new Set((v ? v.members : []).map(m => m.user_id));
    const checks = activePartners().map(u =>
      '<label class="tt-check"><input type="checkbox" data-pid="' + u.id + '"' + (cur.has(u.id) ? ' checked' : '') + '>' + esc(u.name) + '</label>').join('');
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' + streamLabel(stream) + ' split</h2></div>' +
      '<div class="tt-asub" style="margin-bottom:12px;">Pick the partners who share this revenue equally. Saving creates a new version from the effective date — past bookings keep their existing split.</div>' +
      '<div class="tt-checks">' + (checks || '<span class="tt-asub">Add active partners first.</span>') + '</div>' +
      '<label class="tt-field" style="max-width:240px;margin-top:14px;"><span>Effective from <span class="tt-hint">(today or later)</span></span><input type="date" id="sf-date" value="' + today() + '" min="' + today() + '"></label>' +
      '<div class="tt-ferr" id="sf-err"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="sf-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="sf-save" data-stream="' + stream + '">Save split</button></div></div>';
  }
  function splitHistory(){
    const vs = (state.splits || []).slice().sort((a, b) =>
      String(b.effective_from).localeCompare(String(a.effective_from)) || a.stream.localeCompare(b.stream));
    if (!vs.length) return '';
    const rows = vs.map(v =>
      '<tr><td><span class="tt-type ' + (v.stream === 'travel' ? 'travel' : 'car') + '">' + streamLabel(v.stream) + '</span></td>' +
      '<td class="tt-ref">' + esc(v.effective_from) + '</td>' +
      '<td>' + v.members.length + '</td>' +
      '<td>' + esc(v.members.map(m => m.name || ('#' + m.user_id)).join(', ')) + '</td></tr>').join('');
    return '<div class="tt-group"><h3>Split history</h3><span class="rule"></span></div>' +
      '<div class="tt-card"><div class="tt-scrollx"><table class="tt-t">' +
      '<thead><tr><th>Stream</th><th>Effective from</th><th>Ways</th><th>Partners</th></tr></thead><tbody>' +
      rows + '</tbody></table></div></div>';
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Partners</h1>' +
      '<div class="tt-lede">The people who can access this dashboard and share in revenue.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="p-add">' + svg(I.plus) + 'Add partner</button></div></div>';

    if (state.form) h += partnerForm(state.form);

    h += '<div class="tt-card" style="margin-top:4px;">';
    if (state.err) h += '<div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div>';
    else if (!state.rows) h += '<div class="tt-empty">Loading…</div>';
    else if (!state.rows.length) h += '<div class="tt-empty">No partners yet — add your first above.</div>';
    else {
      h += '<div class="tt-plist">';
      state.rows.forEach(u => {
        h += '<div class="tt-prow">' +
          '<div class="tt-prow-main"><div class="tt-who">' + esc(u.name) + '</div>' +
            '<div class="tt-prow-sub">' + esc(u.email || '') + '</div>' +
            '<div class="tt-prow-sub">' + esc(u.phone || '—') + '</div></div>' +
          '<div class="tt-prow-side">' +
            (u.active ? '<span class="tt-badge ok">Active</span>' : '<span class="tt-badge done">Inactive</span>') +
            '<div class="tt-prow-acts"><button class="tt-abtn soft" data-edit="' + u.id + '">Edit</button>' +
            (u.active ? '<button class="tt-abtn soft" data-toggle="' + u.id + '" data-to="0">Deactivate</button>'
                      : '<button class="tt-abtn soft" data-toggle="' + u.id + '" data-to="1">Reactivate</button>') +
          '</div></div></div>';
      });
      h += '</div>';
    }
    h += '</div>';

    // revenue splits
    h += '<div class="tt-group"><h3>Revenue splits</h3><span class="rule"></span></div>';
    if (state.splitForm) h += splitForm(state.splitForm);
    h += '<div class="tt-splitrow">' + splitCard('travel', 'Travel split') + splitCard('car', 'Car split') + '</div>';
    h += splitHistory();

    main.innerHTML = h;
    wire();
  }

  function wire(){
    const q = (s) => main.querySelector(s);
    const add = q('#p-add'); if (add) add.addEventListener('click', () => { state.form = { name:'', email:'', phone:'' }; render(); });
    const cancel = q('#p-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#p-save'); if (save) save.addEventListener('click', doSave);
    main.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const u = state.rows.find(x => String(x.id) === b.getAttribute('data-edit'));
      state.form = { id: u.id, name: u.name, email: u.email, phone: u.phone || '' }; render();
    }));
    main.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
      b.disabled = true; patch('users/' + b.getAttribute('data-toggle'), { active: Number(b.getAttribute('data-to')) }).then(load).catch(load);
    }));
    main.querySelectorAll('[data-splitedit]').forEach(b => b.addEventListener('click', () => { state.splitForm = b.getAttribute('data-splitedit'); render(); }));
    const sfc = q('#sf-cancel'); if (sfc) sfc.addEventListener('click', () => { state.splitForm = null; render(); });
    const sfs = q('#sf-save'); if (sfs) sfs.addEventListener('click', doSaveSplit);
  }

  function doSave(){
    const o = {}; main.querySelectorAll('[data-f]').forEach(i => o[i.getAttribute('data-f')] = i.value.trim());
    const ferr = main.querySelector('#p-ferr');
    if (!o.name)  { ferr.textContent = 'Name is required.'; return; }
    if (!o.email) { ferr.textContent = 'Email is required.'; return; }
    const id = state.form.id, btn = main.querySelector('#p-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    (id ? patch('users/' + id, o) : post('users', o))
      .then(() => { state.form = null; load(); })
      .catch(e => { ferr.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
        if (btn) { btn.disabled = false; btn.textContent = id ? 'Save changes' : 'Add partner'; } });
  }

  function doSaveSplit(){
    const stream = main.querySelector('#sf-save').getAttribute('data-stream');
    const members = Array.from(main.querySelectorAll('[data-pid]:checked')).map(i => Number(i.getAttribute('data-pid')));
    const effective_from = main.querySelector('#sf-date').value;
    const err = main.querySelector('#sf-err');
    if (!members.length) { err.textContent = 'Pick at least one partner.'; return; }
    if (!effective_from) { err.textContent = 'Choose an effective date.'; return; }
    if (effective_from < today()) { err.textContent = 'Effective date must be today or later — splits can\'t be backdated.'; return; }
    const btn = main.querySelector('#sf-save'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    post('split-config', { stream, effective_from, members })
      .then(() => { state.splitForm = null; load(); })
      .catch(e => { err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
        if (btn) { btn.disabled = false; btn.textContent = 'Save split'; } });
  }

  load();
}
