// Enquiries screen — the public site's enquiry form lands here (persisted by the
// notifier Worker). The submitted fields are READ-ONLY; the team only triages:
// pick a status and add a free-text note. Saved via PATCH /admin/enquiries/:id
// (Worker writable = status, note only). No create/delete, no conversion flow.
import { get, patch } from './api.js';

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const STATUSES = ['new', 'contacted', 'converted', 'closed', 'spam'];
const STATUS_LABEL = { new:'New', contacted:'Contacted', converted:'Converted', closed:'Closed', spam:'Spam' };
const isStatus = (s) => STATUSES.indexOf(s) !== -1;
const normStatus = (s) => isStatus(s) ? s : 'new';
// reuse existing .tt-badge variants; 'contacted' gets an inline sky tint (no new class)
const STATUS_BADGE = { new:'wait', contacted:'sky', converted:'ok', closed:'done', spam:'due' };
const statusPill = (s) => {
  const key = normStatus(s);
  if (STATUS_BADGE[key] === 'sky')
    return '<span class="tt-badge" style="background:var(--tt-sky-tint);color:var(--tt-terra-2)">' + STATUS_LABEL[key] + '</span>';
  return '<span class="tt-badge ' + STATUS_BADGE[key] + '">' + STATUS_LABEL[key] + '</span>';
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// created_at is "YYYY-MM-DD HH:MM:SS" (UTC, as stored) — show it plainly, no TZ math
function fmtWhen(s){
  if (!s) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s);
  if (!m) return esc(s);
  return Number(m[3]) + ' ' + (MONTHS[Number(m[2]) - 1] || '') + ' ' + m[1] + ' · ' + m[4] + ':' + m[5];
}

export function renderEnquiries(main){
  const state = { rows: null, err: null, filters: { q:'', status:'' } };

  function load(){
    state.rows = null; state.err = null; render();
    get('enquiries')
      .then(r => { state.rows = r.data; render(); })
      .catch(e => { state.err = e.message || 'Could not load enquiries'; render(); });
  }

  const opt = (v, label, sel) => '<option value="' + esc(v) + '"' + (String(sel) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>';

  // ---------- filters ----------
  function filterBar(){
    const f = state.filters;
    const statusOpts = '<option value="">All status</option>' + STATUSES.map(s => opt(s, STATUS_LABEL[s], f.status)).join('');
    const anyActive = Boolean(f.q || f.status);
    const items =
      '<label class="tt-field"><span>Status</span><select data-flt="status">' + statusOpts + '</select></label>' +
      '<label class="tt-field tt-fltwide"><span>Search</span><input type="text" data-flt="q" value="' + esc(f.q) + '" placeholder="E#, name, phone, email, intent, destination, message…"></label>' +
      '<button class="tt-abtn soft tt-fmorebtn" id="enq-clear"' + (anyActive ? '' : ' disabled') + '>Reset filters</button>';
    return '<div class="tt-cbfilters"><div class="tt-fhdr">Filters <span class="tt-asub" id="enq-count"></span></div><div class="tt-fbar">' + items + '</div></div>';
  }
  function matches(e){
    const f = state.filters;
    if (f.status && normStatus(e.status) !== f.status) return false;
    if (f.q){
      const hay = [e.display_id, e.name, e.phone, e.email, e.intent, e.destination, e.message, e.country, e.note]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  }

  // ---------- list ----------
  function contactLine(e){
    const bits = [];
    if (e.phone) bits.push(esc(e.phone));
    if (e.email) bits.push(esc(e.email));
    return bits.join(' · ');
  }
  function rowHtml(e){
    const status = normStatus(e.status);
    const where = [e.intent, e.destination].filter(Boolean).map(esc).join(' · ');
    const emailPill = e.email_sent ? '' : ' <span class="tt-badge due" title="The notification email did not go out">email failed</span>';
    const meta = [fmtWhen(e.created_at), e.country].filter(Boolean).map(esc).join(' · ');
    return '<div class="tt-prow">' +
      '<div class="tt-prow-main">' +
        '<div class="tt-who">' + esc(e.name || 'Someone') +
          ' <span class="tt-type travel">' + esc(e.display_id) + '</span> ' + statusPill(status) + emailPill + '</div>' +
        (contactLine(e) ? '<div class="tt-prow-sub">' + contactLine(e) + '</div>' : '') +
        (where ? '<div class="tt-prow-sub">' + where + '</div>' : '') +
        (e.message ? '<div class="tt-prow-sub">“' + esc(e.message) + '”</div>' : '') +
        (meta ? '<div class="tt-asub" style="margin-top:2px;">' + meta + (e.source_url ? ' · ' + esc(e.source_url) : '') + '</div>' : '') +
      '</div>' +
      '<div class="tt-prow-side" style="align-items:stretch;min-width:240px;">' +
        '<div class="tt-fgrid" style="grid-template-columns:1fr;gap:8px;">' +
          '<label class="tt-field"><span>Status</span><select data-stsel="' + e.id + '">' +
            STATUSES.map(s => opt(s, STATUS_LABEL[s], status)).join('') + '</select></label>' +
          '<label class="tt-field"><span>Note</span><input type="text" data-note="' + e.id + '" value="' + esc(e.note || '') + '" placeholder="follow-up note (optional)"></label>' +
        '</div>' +
        '<div class="tt-ferr" data-err="' + e.id + '"></div>' +
        '<div class="tt-prow-acts" style="justify-content:flex-end;"><button class="tt-abtn soft" data-save="' + e.id + '">Save</button></div>' +
      '</div></div>';
  }
  function renderList(){
    const list = main.querySelector('#enq-list'); if (!list) return;
    const rows = (state.rows || []).filter(matches);
    const cnt = main.querySelector('#enq-count');
    if (cnt) cnt.textContent = '(' + rows.length + ' of ' + state.rows.length + (state.rows.length === 1 ? ' enquiry' : ' enquiries') + ')';
    list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<div class="tt-empty">No enquiries match these filters.</div>';
    wireRows();
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Enquiries</h1>' +
      '<div class="tt-lede">Everything that comes through the site’s enquiry form. Read-only details; set a status and leave a note as you follow up.</div></div></div>';
    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else if (!state.rows.length) h += '<div class="tt-card"><div class="tt-empty">No enquiries yet.</div></div>';
    else h += filterBar() + '<div class="tt-card"><div class="tt-plist" id="enq-list"></div></div>';
    main.innerHTML = h;
    wireChrome();
    if (state.rows && state.rows.length && !state.err) renderList();
  }

  // ---------- wiring ----------
  function wireChrome(){
    const q = (s) => main.querySelector(s);
    main.querySelectorAll('[data-flt]').forEach(el => {
      const ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        state.filters[el.getAttribute('data-flt')] = el.value;
        const clr = q('#enq-clear'); if (clr) clr.disabled = !(state.filters.q || state.filters.status);
        renderList();
      });
    });
    const clr = q('#enq-clear'); if (clr) clr.addEventListener('click', () => { state.filters = { q:'', status:'' }; render(); });
  }
  function wireRows(){
    main.querySelectorAll('#enq-list [data-save]').forEach(btn => btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-save'));
      const sel = main.querySelector('[data-stsel="' + id + '"]');
      const noteEl = main.querySelector('[data-note="' + id + '"]');
      const err = main.querySelector('[data-err="' + id + '"]');
      if (err) err.textContent = '';
      const status = sel ? sel.value : 'new';
      const note = noteEl ? noteEl.value.trim() : '';
      btn.disabled = true; btn.textContent = 'Saving…';
      patch('enquiries/' + id, { status, note: note || null })
        .then(r => {
          const row = (state.rows || []).find(x => x.id === id);
          if (row) { row.status = (r.data && r.data.status) || status; row.note = (r.data && r.data.note) || (note || null); }
          btn.textContent = 'Saved';
          setTimeout(() => renderList(), 600);  // refresh pill + keep filters
        })
        .catch(e => {
          if (err) err.textContent = (e && e.data && (e.data.detail || e.data.error)) || e.message || 'Could not save';
          btn.disabled = false; btn.textContent = 'Save';
        });
    }));
  }

  load();
}
