// settlepdf.js — builds the Settlement Statement PDF from the settlement engine
// output + raw bookings, wrapped in the standard letterhead (pdf.js). Keeps all
// DOM/trigger logic out of settlelib.js. Money comes straight from the engine
// (pools / partners / detail / blockers) — nothing is re-derived here.
import { computeSettlement } from './settlelib.js';
import { buildDoc, downloadPdf, PDF } from './pdf.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthLabel = (ym) => { const [y, m] = ym.split('-'); return MONTHS[Number(m) - 1] + ' ' + y; };

// "Rs 12,340" / "-Rs 500" — Rs (not the rupee glyph) so it always renders in
// pdfmake's bundled Roboto. en-IN grouping.
const m = (n) => (n < 0 ? '-Rs ' : 'Rs ') + Math.abs(Math.round(n || 0)).toLocaleString('en-IN');
const fmtDate = (s) => { if (!s) return ''; const x = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); return x ? (Number(x[3]) + ' ' + SHORT[Number(x[2]) - 1] + ' ' + x[1]) : String(s); };
const span = (a, b) => { const A = fmtDate(a), B = fmtDate(b); return A && B ? (A === B ? A : A + ' → ' + B) : (A || B || '—'); };

export async function downloadSettlementPdf(data, month, opts){
  const doc = await buildSettlementDoc(data, month, opts);
  return downloadPdf(doc, 'Settlement-' + month + '.pdf');
}

// Build the pdfmake docDefinition (no download) — exported so it can be rendered
// or tested without a browser download.
export async function buildSettlementDoc(data, month, opts){
  const o = opts || {};
  const r = computeSettlement(data, month);
  const users = data.users || [];
  const nameOf = (uid) => { const u = users.find(x => x.id === Number(uid)); return u ? u.name : ('#' + uid); };
  const sharesLine = (shares) => {
    const keys = Object.keys(shares || {});
    if (!keys.length) return null;
    return { text: 'Split — ' + keys.map(k => nameOf(k) + ' ' + m(shares[k])).join('  ·  '), style: 'note', margin: [0, 1, 0, 0] };
  };

  // ---- summary pots ----
  const travelPot = r.pools.travelNet - r.pools.travelExp;
  const carPot = r.pools.carNet - r.pools.carExp;
  const total = travelPot + carPot + r.pools.reimburse;
  const potCell = (t, o) => Object.assign({ text: t, fontSize: 8.5 }, o || {});
  const dash = { text: '—', color: PDF.muted, fontSize: 8.5, alignment: 'right' };
  const potsTable = {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: [
        [{ text: 'Pool', style: 'th' }, { text: 'Gross', style: 'th', alignment: 'right' }, { text: 'Expenses', style: 'th', alignment: 'right' }, { text: 'Net', style: 'th', alignment: 'right' }],
        [potCell('Travel pot', { bold: true }), potCell(m(r.pools.travelNet), { alignment: 'right' }), potCell(m(r.pools.travelExp), { alignment: 'right' }), potCell(m(travelPot), { bold: true, alignment: 'right' })],
        [potCell('Car pot', { bold: true }), potCell(m(r.pools.carNet), { alignment: 'right' }), potCell(m(r.pools.carExp), { alignment: 'right' }), potCell(m(carPot), { bold: true, alignment: 'right' })],
        [potCell('Reimbursements', { bold: true }), dash, dash, potCell(m(r.pools.reimburse), { bold: true, alignment: 'right' })],
        [potCell('Month total', { bold: true, color: PDF.ink }), potCell('', {}), potCell('', {}), potCell(m(total), { bold: true, color: PDF.ink, alignment: 'right' })],
      ],
    },
    layout: gridLayout(),
    margin: [0, 2, 0, 0],
  };

  // ---- partner split table ----
  const statusText = (p) => p.settled ? (p.stale ? 'Needs update' : 'Settled') : 'Unsettled';
  const partnerBody = [[
    { text: 'Partner', style: 'th' }, { text: 'Travel', style: 'th', alignment: 'right' },
    { text: 'Car', style: 'th', alignment: 'right' }, { text: 'Reimburse', style: 'th', alignment: 'right' },
    { text: 'Total', style: 'th', alignment: 'right' }, { text: 'Status', style: 'th' },
  ]];
  r.partners.forEach(p => partnerBody.push([
    { text: p.name, fontSize: 8.5 }, { text: m(p.travel), fontSize: 8.5, alignment: 'right' },
    { text: m(p.car), fontSize: 8.5, alignment: 'right' }, { text: m(p.reimburse), fontSize: 8.5, alignment: 'right' },
    { text: m(p.total), fontSize: 8.5, bold: true, alignment: 'right' }, { text: statusText(p), fontSize: 8.5 },
  ]));
  const partnerTable = r.partners.length
    ? { table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'], body: partnerBody }, layout: gridLayout(), margin: [0, 2, 0, 0] }
    : { text: 'Nothing to settle in ' + monthLabel(month) + '.', style: 'note' };

  // ---- detailed booking breakdown (ledger blocks) ----
  const travelD = r.detail.filter(d => d.btype === 'travel');
  const carD = r.detail.filter(d => d.btype === 'car' || d.btype === 'car-linked');
  const expD = r.detail.filter(d => d.btype === 'expense');

  const refTag = (d) => d.ref + (d.kind === 'reverse' ? '  (cancellation reversal)' : '');
  const block = (lines) => ({ stack: lines.filter(Boolean), margin: [0, 0, 0, 7] });

  const travelBlocks = travelD.map(d => block([
    { text: [ { text: refTag(d), bold: true, color: PDF.ink }, { text: '   ' + (d.customer || '—') + '  ·  ' + span(d.start, d.end) + (d.pax ? '  ·  ' + d.pax + ' pax' : ''), color: PDF.muted } ] },
    { text: 'Gross ' + m(d.gross) + '  − cost ' + m(d.comp.costExceptCar) + '  − car ' + m(d.comp.carCost) + '  − commission ' + m(d.comp.commission) + '  =  Net ' + m(d.net), fontSize: 8.5 },
    sharesLine(d.shares),
  ]));

  const carBlocks = carD.map(d => block([
    { text: [ { text: refTag(d), bold: true, color: PDF.ink }, { text: '   ' + (d.customer || d.route || '—') + '  ·  ' + span(d.start, d.end) + (d.duty ? '  ·  ' + d.duty : ''), color: PDF.muted } ] },
    { text: 'Fare ' + m(d.fare) + '  − commission ' + m(d.comp.commission) + '  − toll ' + m(d.comp.toll) + '  − driver ' + m(d.comp.driverCost) + '  =  Net ' + m(d.net), fontSize: 8.5 },
    sharesLine(d.shares),
  ]));

  const expBlocks = expD.map(d => block([
    { text: [ { text: refTag(d), bold: true, color: PDF.ink }, { text: '   ' + (d.reason || '—') + '  ·  ' + (d.category === 'agency' ? 'travel' : 'car') + ' pot  ·  ' + fmtDate(d.date), color: PDF.muted } ] },
    { text: 'Amount ' + m(d.amount) + '  (reduces ' + (d.category === 'agency' ? 'travel' : 'car') + ' pot)' + (d.paidBy != null ? '  ·  reimburses ' + nameOf(d.paidBy) + ' ' + m(d.reimburse) : ''), fontSize: 8.5 },
    sharesLine(d.shares),
  ]));

  // ---- not-settled ----
  const unrec = r.blockers.filter(b => b.kind === 'unrecognized');
  const noVer = r.blockers.filter(b => b.kind === 'no-version');
  const unrecBlocks = unrec.map(b => block([
    { text: [ { text: b.ref, bold: true, color: PDF.ink }, { text: '   ' + (b.customer || b.route || '—') + '  ·  ' + span(b.start, b.end), color: PDF.muted } ] },
    { text: 'Reason: ' + b.reason + '.   Gross ' + (b.gross == null ? 'pending' : m(b.gross)) + '  ·  paid ' + m(b.paid) + '  ·  outstanding ' + (b.outstanding == null ? '—' : m(b.outstanding)), fontSize: 8.5 },
    { text: 'Payments: ' + (b.payments && b.payments.length ? b.payments.map(p => fmtDate(p.on) + ' ' + m(p.amount) + (p.note ? ' (' + p.note + ')' : '')).join('  ·  ') : 'none recorded'), style: 'note' },
  ]));

  // ---- assemble ----
  const content = [];
  content.push({ text: 'Summary', style: 'sectionH' });
  content.push(potsTable);
  content.push({ text: 'Partner split', style: 'sectionH' });
  content.push(partnerTable);
  content.push({ text: 'This split is equal among each pot’s partners for the month; a booking is recognized the month it becomes fully paid.', style: 'note', margin: [0, 4, 0, 0] });

  content.push({ text: 'Booking breakdown — ' + monthLabel(month), style: 'sectionH' });
  pushGroup(content, 'Travel bookings', travelBlocks);
  pushGroup(content, 'Car bookings', carBlocks);
  pushGroup(content, 'Expenses', expBlocks);
  if (!travelBlocks.length && !carBlocks.length && !expBlocks.length)
    content.push({ text: 'No bookings or expenses were recognized this month.', style: 'note' });

  content.push({ text: 'Not settled yet', style: 'sectionH' });
  if (unrecBlocks.length) {
    content.push({ text: 'These trips have ended but aren’t recognizable yet — they settle in whatever month they become fully paid. Nothing is lost.', style: 'note', margin: [0, 0, 0, 6] });
    unrecBlocks.forEach(b => content.push(b));
  } else {
    content.push({ text: 'Nothing outstanding — every ended trip is fully recognized.', style: 'note' });
  }
  if (noVer.length)
    content.push({ text: 'Split configuration missing for: ' + noVer.map(b => b.ref + ' (' + b.reason + ')').join('; '), style: 'note', margin: [0, 6, 0, 0] });

  // ---- meta (right of the title) ----
  const settledRows = o.settledRows || [];
  const settled = settledRows.length > 0;
  const meta = [ 'Generated ' + fmtDate(new Date().toISOString()) ];
  meta.push(settled ? 'Status: Settled' : 'Status: Draft (unsettled)');
  if (settled) {
    const by = settledRows.find(s => s.settled_by) ? settledRows.find(s => s.settled_by).settled_by : null;
    const on = settledRows[0].settled_at ? fmtDate(settledRows[0].settled_at) : null;
    if (by) meta.push('Settled by ' + by);
    if (on) meta.push('on ' + on);
  }

  return buildDoc({ title: 'Settlement Statement', subtitle: monthLabel(month), meta, content });
}

function pushGroup(content, title, blocks){
  if (!blocks.length) return;
  content.push({ text: title, bold: true, color: PDF.ink, fontSize: 9.5, margin: [0, 6, 0, 4] });
  blocks.forEach(b => content.push(b));
}

// thin table layout — horizontal rules + light inner vertical rules (so columns
// of amounts don't read as one jumbled block); no outer left/right edge lines.
function gridLayout(){
  return {
    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4),
    vLineWidth: (i, node) => (i === 0 || i === node.table.body[0].length ? 0 : 0.5),
    hLineColor: () => PDF.rule,
    vLineColor: () => PDF.rule,
    paddingTop: () => 4, paddingBottom: () => 4, paddingLeft: () => 8, paddingRight: () => 8,
  };
}
