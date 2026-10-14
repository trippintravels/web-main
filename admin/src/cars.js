// Cars screen — the fleet, add/edit (make -> model cascade), and a per-car
// documents panel: the standard set (RC / insurance / pollution / fitness /
// permit / road-tax / VLTD) plus free-form "additional" documents you label
// yourself. Files go to R2; expiries feed the dashboard alerts. Additional
// docs live as a JSON array in cars.extra_docs: [{label, key, expiry}].
import { get, post, patch, upload, fetchBlobUrl, deleteFile } from './api.js';
import { I, svg } from './icons.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const daysUntil = (d) => { if (!d) return null; const t = new Date(); t.setHours(0,0,0,0); return Math.ceil((new Date(d) - t) / 864e5); };
const ARROW_LEFT = '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
const IC = {
  upload: '<path d="M12 15V4M8 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.7"/>',
};
// filled car silhouette used as the thumbnail placeholder
const CAR_GLYPH = '<path d="M5.2 15.3l1.1-3.8A2.6 2.6 0 0 1 8.8 9.6h6.4a2.6 2.6 0 0 1 2.5 1.9l1.1 3.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.6 15.2h16.8a1 1 0 0 1 1 1v2.1a.9.9 0 0 1-.9.9h-1.2a.9.9 0 0 1-.9-.9v-.6H5.6v.6a.9.9 0 0 1-.9.9H3.5a.9.9 0 0 1-.9-.9v-2.1a1 1 0 0 1 1-1z" fill="currentColor" opacity=".9"/><circle cx="7.4" cy="16.2" r="1" fill="#FBF9F3"/><circle cx="16.6" cy="16.2" r="1" fill="#FBF9F3"/>';

const DOCS = [
  { key:'rc',        label:'RC',         docField:'rc_doc_key',        expiryField:null },
  { key:'insurance', label:'Insurance',  docField:'insurance_doc_key', expiryField:'insurance_expiry' },
  { key:'pollution', label:'Pollution',  docField:'pollution_doc_key', expiryField:'pollution_expiry' },
  { key:'fitness',   label:'Fitness',    docField:'fitness_doc_key',   expiryField:'fitness_expiry' },
  { key:'permit',    label:'Permit',     docField:'permit_doc_key',    expiryField:'permit_expiry' },
  { key:'road_tax',  label:'Road tax',   docField:'road_tax_doc_key',  expiryField:'road_tax_expiry' },
  { key:'vltd',      label:'VLTD',       docField:'vltd_doc_key',       expiryField:'vltd_expiry' },
];

function parseExtra(car){
  try { const a = JSON.parse(car.extra_docs || '[]'); return Array.isArray(a) ? a : []; } catch (_) { return []; }
}
function expiryBadge(label, expiry){
  if (!expiry) return '';
  const n = daysUntil(expiry);
  const cls = n < 0 ? 'due' : (n <= 30 ? 'wait' : 'ok');
  const txt = n < 0 ? 'expired' : (n <= 30 ? n + 'd' : 'ok');
  return '<span class="tt-badge ' + cls + '" style="margin:0 6px 4px 0;">' + label + ' ' + txt + '</span>';
}

export function renderCars(main){
  const state = { rows: null, makes: [], models: [], err: null, form: null,
                  doc: null, extra: [], pf: {}, clear: {}, xdel: [] };
  let xid = 0;  // transient row ids for additional docs
  const imgCache = {};  // R2 key -> object URL, so thumbnails load once

  function load(){
    state.rows = null; state.err = null; render();
    Promise.all([get('cars'), get('makes')])
      .then(([c, m]) => { state.rows = c.data; state.makes = m.makes; render(); })
      .catch(e => { state.err = e.message || 'Could not load'; render(); });
  }
  function loadModels(make, cb){
    if (!make) { state.models = []; cb && cb(); return; }
    get('car-models?make=' + encodeURIComponent(make)).then(r => { state.models = r.models || []; cb && cb(); })
                                                       .catch(() => { state.models = []; cb && cb(); });
  }

  // ---------- add/edit form ----------
  function carForm(f){
    const makeOpts = '<option value="">Select make…</option>' +
      state.makes.map(mk => '<option' + (mk === f.make ? ' selected' : '') + '>' + esc(mk) + '</option>').join('');
    const modelOpts = '<option value="">' + (f.make ? 'Select model…' : 'Pick a make first') + '</option>' +
      state.models.map(m => '<option value="' + m.id + '"' + (String(m.id) === String(f.model_id) ? ' selected' : '') + '>' + esc(m.model) + '</option>').join('');
    return '<div class="tt-card" style="margin:4px 0 14px;"><div class="tt-cardhd"><h2>' + (f.id ? 'Edit car' : 'Add car') + '</h2></div>' +
      '<div class="tt-fgrid">' +
        '<label class="tt-field"><span>Make</span><select data-f="make">' + makeOpts + '</select></label>' +
        '<label class="tt-field"><span>Model</span><select data-f="model_id">' + modelOpts + '</select></label>' +
        '<label class="tt-field"><span>Registration no.</span><input type="text" data-f="registration_no" value="' + esc(f.registration_no || '') + '" placeholder="WB73U8875"></label>' +
      '</div><div class="tt-ferr" id="c-ferr"></div>' +
      '<div class="tt-factions"><button class="tt-btn ghost" id="c-cancel">Cancel</button>' +
      '<button class="tt-btn prim" id="c-save">' + (f.id ? 'Save car' : 'Add car') + '</button></div></div>';
  }

  // ---------- documents panel ----------
  // Each row = three aligned zones: name · expiry · file. delId set => this is
  // an additional doc, whose only removal action is Delete (drops the row).
  function statusChip(token, hasDoc){
    const pend = state.pf[token];
    return pend ? '<span class="tt-badge wait tt-fnchip" data-fn="' + token + '">New · ' + esc(pend.name) + '</span>'
         : hasDoc ? '<span class="tt-badge ok" data-fn="' + token + '">Uploaded</span>'
         : '<span class="tt-badge done" data-fn="' + token + '">None</span>';
  }
  function fileControl(token, hasDoc, viewKey, delId){
    const pend = state.pf[token];
    let acts = '<label class="tt-dbtn" data-lbl="' + token + '" title="' + ((hasDoc || pend) ? 'Replace file' : 'Choose file') + '" aria-label="Choose file">' +
               '<input type="file" data-file="' + token + '">' + svg(IC.upload) + '</label>';
    if (hasDoc) acts += '<a class="tt-dbtn" data-view="' + esc(viewKey) + '" title="View" aria-label="View">' + svg(IC.eye) + '</a>';
    if (delId != null) acts += '<a class="tt-dbtn danger" data-xdel="' + delId + '" title="Delete" aria-label="Delete">' + svg(I.trash) + '</a>';
    else if (hasDoc) acts += '<a class="tt-dbtn danger" data-rm="' + token + '" title="Remove" aria-label="Remove">' + svg(I.trash) + '</a>';
    return '<div class="tt-docacts">' + acts + '</div>';
  }
  function expiryZone(inner){ return '<div class="tt-docexp">' + inner + '</div>'; }
  function stdRow(d){
    const car = state.doc;
    const cleared = !!state.clear[d.docField];
    const hasDoc = !cleared && !!car[d.docField];
    const exp = d.expiryField ? (car[d.expiryField] || '') : null;
    return '<div class="tt-docrow"><div class="tt-docname">' + d.label +
      (d.expiryField ? '' : ' <span class="tt-hint">(no expiry)</span>') + '</div>' +
      expiryZone((d.expiryField ? '<span class="tt-doclbl">Expiry</span><input type="date" data-exp="' + d.expiryField + '" value="' + esc(exp) + '">' : '') + statusChip(d.key, hasDoc)) +
      fileControl(d.key, hasDoc, car[d.docField], null) + '</div>';
  }
  function extraRow(x){
    const hasDoc = !!x.key;
    return '<div class="tt-docrow" data-xrow="' + x._id + '">' +
      '<div class="tt-docname"><input type="text" class="tt-lblinput" data-xlabel="' + x._id + '" value="' + esc(x.label || '') + '" placeholder="Document name"></div>' +
      expiryZone('<span class="tt-doclbl">Expiry</span><input type="date" data-xexp="' + x._id + '" value="' + esc(x.expiry || '') + '">' + statusChip('x' + x._id, hasDoc)) +
      fileControl('x' + x._id, hasDoc, x.key, x._id) + '</div>';
  }
  function docsPanel(car){
    const title = [car.make, car.model].filter(Boolean).join(' ') + ' · ' + esc(car.registration_no);
    const std = DOCS.map(stdRow).join('');
    const extra = state.extra.map(extraRow).join('') ||
      '<div class="tt-asub" style="padding:10px 0;">No additional documents yet.</div>';
    return '<div class="tt-head">' +
      '<div class="tt-headl"><button class="tt-iconbtn" id="doc-back" aria-label="Back to fleet">' + svg(ARROW_LEFT) + '</button>' +
      '<div><h1 class="tt-h1">Documents</h1><div class="tt-lede">' + esc(title) + '</div></div></div></div>' +
      '<div class="tt-card">' + std + '</div>' +
      '<div class="tt-group"><h3>Additional documents</h3><span class="rule"></span></div>' +
      '<div class="tt-card">' + extra +
        '<div class="tt-factions" style="justify-content:flex-start;margin-top:4px;">' +
        '<button class="tt-btn ghost" id="doc-addx">' + svg(I.plus) + 'Add document</button></div></div>' +
      '<div class="tt-ferr" id="doc-err"></div>' +
      '<div class="tt-factions"><button class="tt-btn prim" id="doc-save">Save documents</button></div>';
  }

  // ---------- render ----------
  function render(){
    if (state.doc) { main.innerHTML = docsPanel(state.doc); wireDocs(); return; }

    let h = '<div class="tt-head"><div><h1 class="tt-h1">Cars</h1>' +
      '<div class="tt-lede">Your fleet, documents and validity. Bookings use only cars listed here.</div></div>' +
      '<div class="tt-actions"><button class="tt-btn prim" id="c-add">' + svg(I.plus) + 'Add car</button></div></div>';

    if (state.form) h += carForm(state.form);

    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else if (!state.rows.length) h += '<div class="tt-card"><div class="tt-empty">No cars yet — add your first above.</div></div>';
    else {
      h += '<div class="tt-card"><div class="tt-plist">';
      state.rows.forEach(c => {
        const pills = DOCS.filter(d => d.expiryField).map(d => expiryBadge(d.label === 'Pollution' ? 'PUC' : d.label, c[d.expiryField])).join('') || '<span class="tt-asub">No document dates yet</span>';
        h += '<div class="tt-prow">' +
            (c.image_url ? '<img class="tt-carthumb" data-imgkey="' + esc(c.image_url) + '" alt="">'
                         : '<div class="tt-carthumb ph">' + svg(CAR_GLYPH) + '</div>') +
            '<div class="tt-prow-main">' +
            '<div class="tt-who">' + esc([c.make, c.model].filter(Boolean).join(' ') || 'Car') + '</div>' +
            '<div class="tt-prow-sub">' + esc(c.registration_no) + (c.body_type ? ' · ' + esc(c.body_type) : '') + '</div>' +
            '<div class="tt-prow-sub" style="margin-top:6px;">' + pills + '</div></div>' +
          '<div class="tt-prow-side">' +
            (c.active ? '<span class="tt-badge ok">Active</span>' : '<span class="tt-badge done">Inactive</span>') +
            '<div class="tt-prow-acts">' +
              '<button class="tt-abtn soft" data-doc="' + c.id + '">Documents</button>' +
              '<button class="tt-abtn soft" data-edit="' + c.id + '">Edit</button>' +
              (c.active ? '<button class="tt-abtn soft" data-toggle="' + c.id + '" data-to="0">Deactivate</button>'
                        : '<button class="tt-abtn soft" data-toggle="' + c.id + '" data-to="1">Reactivate</button>') +
            '</div></div></div>';
      });
      h += '</div></div>';
    }
    main.innerHTML = h;
    wireFleet();
  }

  // ---------- fleet wiring ----------
  function wireFleet(){
    const q = (s) => main.querySelector(s);
    const add = q('#c-add'); if (add) add.addEventListener('click', () => { state.form = { make:'', model_id:'', registration_no:'' }; state.models = []; render(); });
    const cancel = q('#c-cancel'); if (cancel) cancel.addEventListener('click', () => { state.form = null; render(); });
    const save = q('#c-save'); if (save) save.addEventListener('click', doSaveCar);
    const mk = q('[data-f="make"]'); if (mk) mk.addEventListener('change', () => {
      state.form.make = mk.value; state.form.model_id = ''; loadModels(mk.value, render);
    });
    main.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const c = state.rows.find(x => String(x.id) === b.getAttribute('data-edit'));
      state.form = { id: c.id, make: c.make || '', model_id: c.model_id || '', registration_no: c.registration_no };
      loadModels(c.make, render);
    }));
    main.querySelectorAll('[data-doc]').forEach(b => b.addEventListener('click', () => {
      const car = state.rows.find(x => String(x.id) === b.getAttribute('data-doc'));
      state.doc = car; state.pf = {}; state.clear = {}; state.xdel = [];
      state.extra = parseExtra(car).map(x => Object.assign({ _id: ++xid }, x));
      render();
    }));
    main.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
      b.disabled = true; patch('cars/' + b.getAttribute('data-toggle'), { active: Number(b.getAttribute('data-to')) }).then(load).catch(load);
    }));
    // thumbnails live in R2 (private), so fetch with auth and swap in the object URL
    main.querySelectorAll('[data-imgkey]').forEach(async img => {
      const k = img.getAttribute('data-imgkey');
      try { img.src = imgCache[k] || (imgCache[k] = await fetchBlobUrl(k)); }
      catch (_) { const ph = document.createElement('div'); ph.className = 'tt-carthumb ph'; ph.innerHTML = svg(CAR_GLYPH); img.replaceWith(ph); }
    });
  }

  function doSaveCar(){
    const o = {}; main.querySelectorAll('[data-f]').forEach(i => o[i.getAttribute('data-f')] = i.value.trim());
    const ferr = main.querySelector('#c-ferr');
    if (!o.registration_no) { ferr.textContent = 'Registration number is required.'; return; }
    const body = { registration_no: o.registration_no };
    if (o.model_id) body.model_id = Number(o.model_id);
    const id = state.form.id, btn = main.querySelector('#c-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    (id ? patch('cars/' + id, body) : post('cars', body))
      .then(() => { state.form = null; load(); })
      .catch(e => { ferr.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
        if (btn) { btn.disabled = false; btn.textContent = id ? 'Save car' : 'Add car'; } });
  }

  // ---------- documents wiring ----------
  // pull in-progress edits back into state so a re-render doesn't drop them
  function syncAll(){
    DOCS.forEach(d => { if (d.expiryField) { const e = main.querySelector('[data-exp="' + d.expiryField + '"]'); if (e) state.doc[d.expiryField] = e.value || null; } });
    state.extra.forEach(x => {
      const l = main.querySelector('[data-xlabel="' + x._id + '"]'); if (l) x.label = l.value;
      const e = main.querySelector('[data-xexp="' + x._id + '"]'); if (e) x.expiry = e.value || null;
    });
  }
  function wireDocs(){
    const back = main.querySelector('#doc-back'); if (back) back.addEventListener('click', () => { state.doc = null; render(); });
    const save = main.querySelector('#doc-save'); if (save) save.addEventListener('click', doSaveDocs);
    const addx = main.querySelector('#doc-addx'); if (addx) addx.addEventListener('click', () => {
      syncAll(); state.extra.push({ _id: ++xid, label:'', key:null, expiry:null }); render();
    });
    // reflect a chosen file in-place (file inputs can't survive a re-render)
    main.querySelectorAll('[data-file]').forEach(fi => fi.addEventListener('change', () => {
      const tok = fi.getAttribute('data-file'), f = fi.files && fi.files[0] ? fi.files[0] : null;
      state.pf[tok] = f;
      const chip = main.querySelector('[data-fn="' + tok + '"]');
      if (chip && f) { chip.className = 'tt-badge wait tt-fnchip'; chip.textContent = 'New · ' + f.name; }
      const lbl = main.querySelector('[data-lbl="' + tok + '"]'); if (lbl && f) lbl.setAttribute('title', 'Replace file');
    }));
    main.querySelectorAll('[data-view]').forEach(a => a.addEventListener('click', async () => {
      try { const url = await fetchBlobUrl(a.getAttribute('data-view')); window.open(url, '_blank'); } catch (_) {}
    }));
    main.querySelectorAll('[data-rm]').forEach(a => a.addEventListener('click', () => {
      const tok = a.getAttribute('data-rm');
      const d = DOCS.find(x => x.key === tok); if (d) { syncAll(); state.clear[d.docField] = true; delete state.pf[tok]; render(); }
    }));
    main.querySelectorAll('[data-xdel]').forEach(a => a.addEventListener('click', () => {
      syncAll(); const id = a.getAttribute('data-xdel');
      const row = state.extra.find(x => String(x._id) === id);
      if (row && row.key) state.xdel.push(row.key);   // purge its R2 object on save
      state.extra = state.extra.filter(x => String(x._id) !== id); delete state.pf['x' + id]; render();
    }));
  }

  async function doSaveDocs(){
    const car = state.doc, err = main.querySelector('#doc-err'); err.textContent = '';
    syncAll();
    // every additional doc that carries a file or key needs a name
    if (state.extra.some(x => (x.key || state.pf['x' + x._id]) && !(x.label || '').trim())) {
      err.textContent = 'Give every additional document a name.'; return;
    }
    const btn = main.querySelector('#doc-save'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    const toDelete = state.xdel.slice();  // R2 keys to purge after a successful save (incl. deleted extra docs)
    try {
      const payload = {};
      main.querySelectorAll('[data-exp]').forEach(i => { payload[i.getAttribute('data-exp')] = i.value || null; });

      // standard docs: removals, then any newly chosen uploads
      for (const d of DOCS) {
        if (state.clear[d.docField]) { if (car[d.docField]) toDelete.push(car[d.docField]); payload[d.docField] = null; }
        const f = state.pf[d.key];
        if (f) {
          if (car[d.docField]) toDelete.push(car[d.docField]);
          const ext = (f.name.split('.').pop() || 'bin').toLowerCase();
          const up = await upload('cars/' + car.registration_no, d.key + '.' + ext, f);
          payload[d.docField] = up.key;
        }
      }

      // additional docs: upload new files, then serialise to extra_docs
      const out = [];
      for (const x of state.extra) {
        let key = x.key || null;
        const f = state.pf['x' + x._id];
        if (f) {
          if (x.key) toDelete.push(x.key);
          const ext = (f.name.split('.').pop() || 'bin').toLowerCase();
          const safe = (x.label || 'doc').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'doc';
          const up = await upload('cars/' + car.registration_no, 'x-' + safe + '-' + Date.now() + '.' + ext, f);
          key = up.key;
        }
        if (key || (x.label || '').trim()) out.push({ label: (x.label || '').trim(), key, expiry: x.expiry || null });
      }
      payload.extra_docs = JSON.stringify(out);

      await patch('cars/' + car.id, payload);
    } catch (e) {
      err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
      if (btn) { btn.disabled = false; btn.textContent = 'Save documents'; }
      return;
    }
    // best-effort cleanup of replaced/removed objects
    for (const k of toDelete) { try { await deleteFile(k); } catch (_) {} }
    state.doc = null; load();
  }

  load();
}
