// Drivers screen — the people who drive the fleet. CRUD plus two documents:
// Identity (no expiry) and Licence (licence_expiry feeds the same expiry alerts
// as the car documents). Files go to R2 under drivers/<id>/. Kept in one form
// (only two docs) reusing the Cars document-row convention.
import { get, post, patch, del, upload, fetchBlobUrl, deleteFile } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const daysUntil = (d) => { if (!d) return null; const t = new Date(); t.setHours(0,0,0,0); return Math.ceil((new Date(d) - t) / 864e5); };
const IC = {
  upload: '<path d="M12 15V4M8 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.7"/>',
};

const DOCS = [
  { key:'identity', label:'Identity', docField:'identity_doc_key', expiryField:null },
  { key:'licence',  label:'Licence',  docField:'licence_doc_key',  expiryField:'licence_expiry' },
];

function expiryBadge(label, expiry){
  if (!expiry) return '';
  const n = daysUntil(expiry);
  const cls = n < 0 ? 'due' : (n <= 30 ? 'wait' : 'ok');
  const txt = n < 0 ? 'expired' : (n <= 30 ? n + 'd' : 'ok');
  return '<span class="tt-badge ' + cls + '" style="margin:0 6px 4px 0;">' + label + ' ' + txt + '</span>';
}

export function renderDrivers(main){
  const state = { rows: null, err: null, form: null, pf: {}, clear: {}, confirm: null, delErr: null, reassign: null, busy: false };

  function load(){
    state.rows = null; state.err = null; render();
    get('drivers').then(r => { state.rows = r.data; render(); })
                  .catch(e => { state.err = e.message || 'Could not load'; render(); });
  }

  // ---------- add/edit form (fields + two document rows) ----------
  function field(label, name, val, type, ph){
    return '<label class="tt-field"><span>' + label + '</span><input type="' + type + '" data-f="' + name + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></label>';
  }
  function statusChip(token, hasDoc){
    const pend = state.pf[token];
    return pend ? '<span class="tt-badge wait tt-fnchip" data-fn="' + token + '">New · ' + esc(pend.name) + '</span>'
         : hasDoc ? '<span class="tt-badge ok" data-fn="' + token + '">Uploaded</span>'
         : '<span class="tt-badge done" data-fn="' + token + '">None</span>';
  }
  function fileControl(token, hasDoc, viewKey){
    const pend = state.pf[token];
    let acts = '<label class="tt-dbtn" data-lbl="' + token + '" title="' + ((hasDoc || pend) ? 'Replace file' : 'Choose file') + '" aria-label="Choose file">' +
               '<input type="file" data-file="' + token + '">' + svg(IC.upload) + '</label>';
    if (hasDoc) acts += '<a class="tt-dbtn" data-view="' + esc(viewKey) + '" title="View" aria-label="View">' + svg(IC.eye) + '</a>';
    if (hasDoc) acts += '<a class="tt-dbtn danger" data-rm="' + token + '" title="Remove" aria-label="Remove">' + svg(I.trash) + '</a>';
    return '<div class="tt-docacts">' + acts + '</div>';
  }
  function docRow(d){
    const f = state.form;
    const cleared = !!state.clear[d.docField];
    const hasDoc = !cleared && !!f[d.docField];
    const exp = d.expiryField ? (f[d.expiryField] || '') : null;
    return '<div class="tt-docrow"><div class="tt-docname">' + d.label +
      (d.expiryField ? '' : ' <span class="tt-hint">(no expiry)</span>') + '</div>' +
      '<div class="tt-docexp">' + (d.expiryField ? '<span class="tt-doclbl">Expiry</span><input type="date" data-exp="' + d.expiryField + '" value="' + esc(exp) + '">' : '') +
        statusChip(d.key, hasDoc) + '</div>' +
      fileControl(d.key, hasDoc, f[d.docField]) + '</div>';
  }
  function driverForm(f){
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' + (f.id ? 'Edit driver' : 'Add driver') + '</h2></div>' +
      '<div class="tt-fgrid">' +
        field('Name','name',f.name,'text','Full name') +
        field('Contact','contact',f.contact,'text','Phone') +
        field('Licence no.','licence_no',f.licence_no,'text','DL number') +
      '</div>' +
      '<div class="tt-group"><h3>Documents</h3><span class="rule"></span></div>' +
      '<div class="tt-card" style="box-shadow:none;border:1px solid var(--tt-line);">' + DOCS.map(docRow).join('') + '</div>' +
      '<div class="tt-ferr" id="d-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="d-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="d-save">' + (f.id ? 'Save driver' : 'Add driver') + '</button></div></div>';
  }

  // ---------- delete / reassign panel (stacks under the driver's row) ----------
  function deletePanel(d){
    const box = (inner) => '<div class="tt-delpanel">' + inner + '</div>';
    if (state.reassign && state.reassign.id === d.id) {
      const others = (state.rows || []).filter(x => x.active && x.id !== d.id);
      const list = state.reassign.bookings.map(b => {
        const dates = [b.start_date, b.end_date].filter(Boolean).join(' → ') || 'no dates';
        return '<li>' + esc(b.display_id || ('#' + b.id)) + ' · ' + esc(dates) + '</li>';
      }).join('');
      return box(
        '<div class="tt-delpanel-hd">Reassign upcoming bookings</div>' +
        '<div class="tt-asub">' + esc(state.delErr || '') + '</div>' +
        '<ul class="tt-delpanel-list">' + list + '</ul>' +
        (others.length
          ? '<label class="tt-field" style="max-width:260px;margin-top:4px;"><span>Reassign all to</span><select id="re-to">' +
              '<option value="">Choose a driver…</option>' + others.map(x => '<option value="' + x.id + '">' + esc(x.name) + '</option>').join('') +
            '</select></label><div class="tt-ferr" id="re-err"></div>' +
            '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" data-delcancel="' + d.id + '">Cancel</button>' +
            '<button class="tt-abtn danger" data-reassign="' + d.id + '">Reassign &amp; delete</button></div>'
          : '<div class="tt-ferr">No other active driver to reassign to — add one first, then retry.</div>' +
            '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" data-delcancel="' + d.id + '">Close</button></div>')
      );
    }
    if (state.delErr) {
      return box(
        '<div class="tt-asub" style="color:var(--tt-bad);font-weight:650;">' + esc(state.delErr) + '</div>' +
        '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" data-delcancel="' + d.id + '">Close</button></div>'
      );
    }
    return box(
      '<div class="tt-asub">Permanently delete <b>' + esc(d.name) + '</b>? This also removes their uploaded documents, and can\'t be undone.</div>' +
      '<div class="tt-factions" style="justify-content:flex-start;"><button class="tt-abtn soft" data-delcancel="' + d.id + '">Cancel</button>' +
      '<button class="tt-abtn danger" data-delok="' + d.id + '">Delete permanently</button></div>'
    );
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Drivers</h1>' +
      '<div class="tt-lede">The people who drive the fleet. Licence expiry feeds the same alerts as car documents.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="d-add">' + svg(I.plus) + 'Add driver</button></div></div>';

    if (state.form) h += driverForm(state.form);

    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else if (!state.rows.length) h += '<div class="tt-card"><div class="tt-empty">No drivers yet — add your first above.</div></div>';
    else {
      h += '<div class="tt-card"><div class="tt-plist">';
      state.rows.forEach(d => {
        const pill = expiryBadge('Licence', d.licence_expiry) || '<span class="tt-asub">No licence date yet</span>';
        const acts = '<div class="tt-prow-acts"><button class="tt-abtn soft" data-edit="' + d.id + '">Edit</button>' +
          (d.active ? '<button class="tt-abtn soft" data-toggle="' + d.id + '" data-to="0">Deactivate</button>'
                    : '<button class="tt-abtn soft" data-toggle="' + d.id + '" data-to="1">Reactivate</button>') +
          '<button class="tt-abtn danger" data-del="' + d.id + '">Delete</button></div>';
        h += '<div class="tt-prow">' +
            '<div class="tt-prow-main"><div class="tt-who">' + esc(d.name) + '</div>' +
              '<div class="tt-prow-sub">' + esc(d.contact || '—') + (d.licence_no ? ' · DL ' + esc(d.licence_no) : '') + '</div>' +
              '<div class="tt-prow-sub" style="margin-top:6px;">' + pill + '</div></div>' +
          '<div class="tt-prow-side">' +
            (d.active ? '<span class="tt-badge ok">Active</span>' : '<span class="tt-badge done">Inactive</span>') +
            acts + '</div></div>';
        if (state.confirm === d.id) h += deletePanel(d);
      });
      h += '</div></div>';
    }
    main.innerHTML = h;
    wire();
  }

  // ---------- wiring ----------
  // pull in-progress edits back into state so a re-render doesn't drop them
  function syncForm(){
    if (!state.form) return;
    main.querySelectorAll('[data-f]').forEach(i => state.form[i.getAttribute('data-f')] = i.value);
    DOCS.forEach(d => { if (d.expiryField) { const e = main.querySelector('[data-exp="' + d.expiryField + '"]'); if (e) state.form[d.expiryField] = e.value || null; } });
  }
  function wire(){
    const q = (s) => main.querySelector(s);
    const add = q('#d-add'); if (add) add.addEventListener('click', () => { state.form = { name:'', contact:'', licence_no:'' }; state.pf = {}; state.clear = {}; render(); });
    const cancel = q('#d-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#d-save'); if (save) save.addEventListener('click', doSave);
    main.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const d = state.rows.find(x => String(x.id) === b.getAttribute('data-edit'));
      state.form = { id: d.id, name: d.name || '', contact: d.contact || '', licence_no: d.licence_no || '',
        licence_expiry: d.licence_expiry || '', identity_doc_key: d.identity_doc_key || '', licence_doc_key: d.licence_doc_key || '' };
      state.pf = {}; state.clear = {}; render();
    }));
    main.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
      b.disabled = true; patch('drivers/' + b.getAttribute('data-toggle'), { active: Number(b.getAttribute('data-to')) }).then(load).catch(load);
    }));
    main.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      state.confirm = Number(b.getAttribute('data-del')); state.delErr = null; state.reassign = null; render();
    }));
    main.querySelectorAll('[data-delcancel]').forEach(b => b.addEventListener('click', () => {
      state.confirm = null; state.delErr = null; state.reassign = null; render();
    }));
    main.querySelectorAll('[data-delok]').forEach(b => b.addEventListener('click', () => doDelete(Number(b.getAttribute('data-delok')), b)));
    main.querySelectorAll('[data-reassign]').forEach(b => b.addEventListener('click', () => doReassignDelete(Number(b.getAttribute('data-reassign')), b)));
    // reflect a chosen file in-place (file inputs can't survive a re-render)
    main.querySelectorAll('[data-file]').forEach(fi => fi.addEventListener('change', () => {
      const tok = fi.getAttribute('data-file'), f = fi.files && fi.files[0] ? fi.files[0] : null;
      state.pf[tok] = f; delete state.clear[DOCS.find(x => x.key === tok).docField];
      const chip = main.querySelector('[data-fn="' + tok + '"]');
      if (chip && f) { chip.className = 'tt-badge wait tt-fnchip'; chip.textContent = 'New · ' + f.name; }
      const lbl = main.querySelector('[data-lbl="' + tok + '"]'); if (lbl && f) lbl.setAttribute('title', 'Replace file');
    }));
    main.querySelectorAll('[data-view]').forEach(a => a.addEventListener('click', async () => {
      try { const url = await fetchBlobUrl(a.getAttribute('data-view')); window.open(url, '_blank'); } catch (_) {}
    }));
    main.querySelectorAll('[data-rm]').forEach(a => a.addEventListener('click', () => {
      const tok = a.getAttribute('data-rm'), d = DOCS.find(x => x.key === tok);
      syncForm(); if (d) { state.clear[d.docField] = true; delete state.pf[tok]; render(); }
    }));
  }

  // best-effort R2 cleanup of a (now deleted) driver's documents
  async function purgeDocs(d){
    for (const k of [d && d.identity_doc_key, d && d.licence_doc_key]) if (k) { try { await deleteFile(k); } catch (_) {} }
  }

  async function doDelete(id, btn){
    const d = (state.rows || []).find(x => x.id === id);
    if (btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }
    try {
      await del('drivers/' + id + '?hard=1');
    } catch (e) {
      const code = e && e.data && e.data.error;
      state.delErr = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not delete';
      // upcoming bookings => offer reassignment; historical / in_use => just show the message
      state.reassign = code === 'reassign_required' ? { id, bookings: (e.data.bookings || []) } : null;
      render(); return;
    }
    await purgeDocs(d);
    state.confirm = null; state.delErr = null; state.reassign = null; load();
  }

  async function doReassignDelete(id, btn){
    const d = (state.rows || []).find(x => x.id === id);
    const sel = main.querySelector('#re-to'), err = main.querySelector('#re-err');
    const toId = sel ? Number(sel.value) : 0;
    if (err) err.textContent = '';
    if (!toId) { if (err) err.textContent = 'Choose a driver to reassign to.'; return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Reassigning…'; }
    try {
      for (const b of state.reassign.bookings) await patch('car-bookings/' + b.id, { driver_id: toId });
      await del('drivers/' + id + '?hard=1');   // upcoming refs now cleared
    } catch (e) {
      // e.g. a past booking surfaced on the retry — show it, drop the reassign UI
      const code = e && e.data && e.data.error;
      state.delErr = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not delete';
      state.reassign = code === 'reassign_required' ? { id, bookings: (e.data.bookings || []) } : null;
      render(); return;
    }
    await purgeDocs(d);
    state.confirm = null; state.delErr = null; state.reassign = null; load();
  }

  async function doSave(){
    syncForm();
    const f = state.form, err = main.querySelector('#d-ferr'); err.textContent = '';
    const name = (f.name || '').trim();
    if (!name) { err.textContent = 'Name is required.'; return; }
    const btn = main.querySelector('#d-save'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    const base = {
      name, contact: (f.contact || '').trim() || null, licence_no: (f.licence_no || '').trim() || null,
      licence_expiry: f.licence_expiry || null,
    };
    const toDelete = [];
    try {
      // need a driver id before uploading docs; create the base row first when new
      let id = f.id;
      if (!id) { const r = await post('drivers', base); id = r.data.id; }
      const payload = { ...base };
      for (const d of DOCS) {
        if (state.clear[d.docField]) { if (f[d.docField]) toDelete.push(f[d.docField]); payload[d.docField] = null; }
        const file = state.pf[d.key];
        if (file) {
          if (f[d.docField]) toDelete.push(f[d.docField]);
          const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
          const up = await upload('drivers/' + id, d.key + '.' + ext, file);
          payload[d.docField] = up.key;
        }
      }
      await patch('drivers/' + id, payload);
    } catch (e) {
      err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
      if (btn) { btn.disabled = false; btn.textContent = f.id ? 'Save driver' : 'Add driver'; }
      return;
    }
    for (const k of toDelete) { try { await deleteFile(k); } catch (_) {} }
    state.form = null; load();
  }

  load();
}
