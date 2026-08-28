// The "up a level" link that sits in the eyebrow above a page title:
//   region page → the landing page      ← destinations — 01
//   zone page   → its region            ← north bengal / darjeeling
//
// A real <button>, so it's keyboard-reachable and announced as a control —
// the previous version was a bare <span> with an onClick, which only worked
// for mouse users. The arrow nudges left on hover, mirroring the rightward
// nudge on the landing page's "explore" links.
export default function BackLink({ onClick, label, tone = 'light', style }) {
  // `tone` is the ground it sits on, not the text colour.
  const dark = tone === 'dark';
  return (
    <button
      type="button"
      className="back-link"
      onClick={onClick}
      style={{
        '--bl-color': dark ? 'rgba(241,235,224,.75)' : 'rgba(41,33,28,.55)',
        '--bl-hover': dark ? 'var(--cream)' : 'var(--bark)',
        '--bl-rule': dark ? 'rgba(241,235,224,.4)' : 'rgba(41,33,28,.3)',
        ...style,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="11 6 5 12 11 18" />
      </svg>
      <span className="bl-label">{label}</span>
    </button>
  );
}
