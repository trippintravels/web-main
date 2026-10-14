// Shared inline-SVG icon set (from the design) + a couple of UI icons.
export const I = {
  dash:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  travel:'<rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  car:'<path d="M5 11l1.5-4A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1l1.5 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="3" y="11" width="18" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="7.5" cy="17.5" r="1.4" fill="currentColor"/><circle cx="16.5" cy="17.5" r="1.4" fill="currentColor"/>',
  pay:'<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 9h18" stroke="currentColor" stroke-width="1.7"/><path d="M7 14h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  fleet:'<rect x="3" y="5" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 11h18" stroke="currentColor" stroke-width="1.7"/><circle cx="7.5" cy="19" r="1.3" fill="currentColor"/><circle cx="16.5" cy="19" r="1.3" fill="currentColor"/>',
  driver:'<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.5" cy="11" r="2.1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M13 9.5h5M13 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  partners:'<circle cx="9" cy="8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="9.5" r="2.1" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 19c0-2.8 2.3-4.5 5-4.5s5 1.7 5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M15 15.2c2 .3 4 1.7 4 3.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  expense:'<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  settle:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 12V3.5A8.5 8.5 0 0 1 20.5 12z" fill="currentColor" opacity=".55"/>',
  doc:'<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  rev:'<path d="M4 15l4-4 3 3 5-6 4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  road:'<path d="M4 20L8 4M20 20L16 4M12 5v2M12 11v2M12 17v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  check:'<path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  close:'<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  edit:'<path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  trash:'<path d="M5 7h14M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
};
export const svg = (p, cls) => '<svg viewBox="0 0 24 24" class="' + (cls || '') + '">' + p + '</svg>';
