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
  const state = { rows: null, err: null, filters: { status:'' } };

  function load(){
    state.rows = null; state.err = null; render();
    get('enquiries')
      .then(r => { state.rows = r.data; render(); })
      .catch(e => { state.err = e.message || 'Could not load enquiries'; render(); });
  }

  const opt = (v, label, sel) => '<option value="' + esc(v) + '"' + (String(sel) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>';

  // ---------- status pills (the filter) ----------
  const pillCount = (st) => (state.rows || []).reduce((n, e) => n + (normStatus(e.status) === st ? 1 : 0), 0);
  function pillsBar(){
    const cur = state.filters.status;
    const total = (state.rows || []).length;
    const pill = (val, label, cls) => {
      const n = val === '' ? total : pillCount(val);
      return '<button class="enq-pill ' + cls + (cur === val ? ' on' : '') + '" data-pill="' + esc(val) + '">' +
        esc(label) + '<span class="c">' + n + '</span></button>';
    };
    return '<div class="enq-pills">' +
      pill('', 'All', 's-all') +
      STATUSES.map(s => pill(s, STATUS_LABEL[s], 's-' + s)).join('') +
      '</div>';
  }
  function matches(e){
    const f = state.filters;
    if (f.status && normStatus(e.status) !== f.status) return false;
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
    list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<div class="tt-empty">No enquiries with this status.</div>';
    wireRows();
  }

  // ---------- render ----------
  function render(){
    let h = '<div class="tt-head"><div><h1 class="tt-h1">Enquiries</h1>' +
      '<div class="tt-lede">Everything that comes through the site’s enquiry form. Read-only details; set a status and leave a note as you follow up.</div></div></div>';
    if (state.err) h += '<div class="tt-card"><div class="tt-empty" style="color:var(--tt-bad)">' + esc(state.err) + '</div></div>';
    else if (!state.rows) h += '<div class="tt-card"><div class="tt-empty">Loading…</div></div>';
    else if (!state.rows.length) h += '<div class="tt-card"><div class="tt-empty">No enquiries yet.</div></div>';
    else h += pillsBar() + '<div class="tt-card"><div class="tt-plist" id="enq-list"></div></div>';
    main.innerHTML = h;
    wireChrome();
    if (state.rows && state.rows.length && !state.err) renderList();
  }

  // ---------- wiring ----------
  function wireChrome(){
    main.querySelectorAll('[data-pill]').forEach(btn => btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-pill');
      state.filters.status = (state.filters.status === v) ? '' : v;  // click the active pill to clear
      render();
    }));
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
