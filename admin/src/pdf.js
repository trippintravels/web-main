// pdf.js — the STANDARD Trippin Travels letterhead + a thin pdfmake wrapper.
// Every admin PDF (settlement statements now; receipts/invoices later) is built
// through buildDoc() so they all carry the same letterhead, footer and styles.
//
// pdfmake is heavy (its bundled fonts are ~1.8MB), so it is loaded lazily on the
// first PDF — see loadPdfMake(). The brand mark on disk (logo-mark-sm.png) is
// white-on-transparent, so for white paper we recolor it to BRAND.ink at runtime
// via a canvas (tintLogo) rather than shipping a second asset.

// ---- brand (sourced from the public site: data.js + SiteFooter.jsx) ----
export const BRAND = {
  name: "trippin' travels",
  legalName: "trippin' travels",            // display name doubles as the legal name (per owner)
  tagline: 'go beyond the trails',
  area: 'North Bengal · Eastern Himalaya',
  email: 'hey@trippintravels.in',
  phone: '+91 93828 43212',
  website: 'trippintravels.in',
  instagram: '@trippintravels.in',
  copyright: "© 2026 trippin' travels",
  logoSrc: '/logo-mark-sm.png',
};

// print palette — earthy-neutral, legible on white (not the admin's blue)
export const PDF = {
  ink: '#241E18',      // headings, logo mark, wordmark
  body: '#3A332B',     // body text
  muted: '#8A8178',    // sub-labels, footer
  rule: '#D8D2C8',     // hairlines / table borders
  faint: '#F1EDE6',    // zebra / section fill
  good: '#1E7A4D',     // positive money
  bad: '#B23A4A',      // negative money / unsettled
};

let _pdfMake = null;      // cached pdfmake instance (fonts loaded)
let _logo = null;         // cached tinted-logo dataURL (Promise)

// Load pdfmake + its vfs fonts once.
// pdfmake's vfs_fonts.js is a legacy script that assigns to `this.pdfMake.vfs`.
// Bundlers (Vite 8 / rolldown) rewrite a module's top-level `this` to `undefined`
// — so importing it as a module throws "reading 'pdfMake'". We instead load its
// SOURCE (?raw) and run it with a controlled `this`, which is bundler-proof in both
// dev and prod. A module-import probe is kept as a fallback.
export async function loadPdfMake(){
  if (_pdfMake) return _pdfMake;
  const core = await import('pdfmake/build/pdfmake');
  const pdfMake = core.default || core;
  if (!pdfMake.vfs) {
    const src = (await import('pdfmake/build/vfs_fonts.js?raw')).default;
    const ctx = {};
    /* eslint-disable-next-line no-new-func */
    (new Function(src)).call(ctx);       // top-level `this` === ctx, so ctx.pdfMake.vfs is set
    if (ctx.pdfMake && ctx.pdfMake.vfs) pdfMake.vfs = ctx.pdfMake.vfs;
  }
  _pdfMake = pdfMake;
  return pdfMake;
}

// Recolor the white-on-transparent mark to `color`, return a PNG dataURL.
function tintLogo(src, color){
  if (_logo) return _logo;
  _logo = new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth || 160; c.height = img.naturalHeight || 160;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          ctx.globalCompositeOperation = 'source-in';  // keep alpha, replace color
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, c.width, c.height);
          resolve(c.toDataURL('image/png'));
        } catch (_) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    } catch (_) { resolve(null); }
  });
  return _logo;
}

// The full letterhead block (page 1): tinted mark + wordmark + tagline on the
// left, contact details right-aligned, a hairline underneath.
function letterhead(logoDataUrl){
  const left = [
    { text: BRAND.name, style: 'brandName' },
    { text: BRAND.tagline, style: 'brandTag' },
    { text: BRAND.area, style: 'brandTag' },
  ];
  const leftCol = logoDataUrl
    ? { columns: [ { image: logoDataUrl, width: 34, height: 34 }, { stack: left, margin: [10, 0, 0, 0] } ], width: '*' }
    : { stack: left, width: '*' };
  const right = {
    width: 'auto',
    stack: [
      { text: BRAND.email, style: 'contact' },
      { text: BRAND.phone, style: 'contact' },
      { text: BRAND.website, style: 'contact' },
      { text: BRAND.instagram, style: 'contact' },
    ],
    alignment: 'right',
  };
  return [
    { columns: [leftCol, right], columnGap: 16 },
    { canvas: [{ type: 'line', x1: 0, y1: 6, x2: 515, y2: 6, lineWidth: 1, lineColor: PDF.rule }], margin: [0, 6, 0, 0] },
  ];
}

// compact running header for pages 2+
function runningHeader(){
  return {
    margin: [40, 24, 40, 0],
    columns: [
      { text: BRAND.name, style: 'runName', width: '*' },
      { text: BRAND.website, style: 'runName', alignment: 'right', width: 'auto' },
    ],
  };
}

function footer(currentPage, pageCount){
  return {
    margin: [40, 16, 40, 0],
    columns: [
      { text: BRAND.copyright + '  ·  Internal — confidential', style: 'foot', width: '*' },
      { text: 'Page ' + currentPage + ' of ' + pageCount, style: 'foot', alignment: 'right', width: 'auto' },
    ],
  };
}

// Build a docDefinition wrapped in the standard letterhead/footer/styles.
//   title     — big document title (e.g. "Settlement Statement")
//   subtitle  — the period / sub-line under the title
//   meta      — array of short strings shown right of the title (generated date, status…)
//   content   — pdfmake content array (the body)
export async function buildDoc({ title, subtitle, meta, content }){
  const logo = await tintLogo(BRAND.logoSrc, PDF.ink);
  const head = [];
  if (title) head.push({
    columns: [
      { stack: [ { text: title, style: 'docTitle' }, subtitle ? { text: subtitle, style: 'docSub' } : null ].filter(Boolean), width: '*' },
      (meta && meta.length) ? { stack: meta.map(m => ({ text: m, style: 'metaLine' })), width: 'auto', alignment: 'right' } : null,
    ].filter(Boolean),
    margin: [0, 16, 0, 10],
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 56, 40, 50],
    info: { title: (title || BRAND.name), author: BRAND.name },
    header: (currentPage) => (currentPage === 1 ? null : runningHeader()),
    footer,
    content: [ ...letterhead(logo), ...head, ...content ],
    defaultStyle: { font: 'Roboto', fontSize: 9.5, color: PDF.body, lineHeight: 1.15 },
    styles: {
      brandName: { fontSize: 17, bold: true, color: PDF.ink },
      brandTag:  { fontSize: 8.5, color: PDF.muted },
      contact:   { fontSize: 8.5, color: PDF.body, margin: [0, 0.5, 0, 0.5] },
      runName:   { fontSize: 8, color: PDF.muted },
      docTitle:  { fontSize: 15, bold: true, color: PDF.ink },
      docSub:    { fontSize: 10, color: PDF.body, margin: [0, 2, 0, 0] },
      metaLine:  { fontSize: 8.5, color: PDF.muted, margin: [0, 0.5, 0, 0.5] },
      sectionH:  { fontSize: 11, bold: true, color: PDF.ink, margin: [0, 14, 0, 6] },
      note:      { fontSize: 8.5, color: PDF.muted, italics: true },
      th:        { fontSize: 8.5, bold: true, color: PDF.ink, fillColor: PDF.faint },
      foot:      { fontSize: 7.5, color: PDF.muted },
    },
  };
}

// Generate + download the PDF. Returns a promise that resolves once handed off.
export async function downloadPdf(docDefinition, filename){
  const pdfMake = await loadPdfMake();
  return new Promise((resolve, reject) => {
    try { pdfMake.createPdf(docDefinition).download(filename, () => resolve(true)); }
    catch (e) { reject(e); }
  });
}
