import Logo from './Logo.jsx';

// The mark and the wordmark as one lockup.
//
// This exists as a shared component specifically so the mobile menu can't drift:
// the overlay draws its own copy of the brand over the page's, and the illusion
// only holds if both sit at exactly the same point. Two hand-styled copies would
// come apart the first time either is touched. Same component, same props, same
// position — so keep it that way.
export default function Brandmark({ fontSize = 17, size = 32, color = 'var(--oat)', onClick, style }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(fontSize * 0.46),
        color,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* the mark is set, not derived from the type — the footer pairs the same
          mark with the script wordmark at a different size, and only fixed
          numbers keep the two lockups reading as one brand: 32 / 42. */}
      <Logo size={size} />
      <span className="wordmark" style={{ fontSize }}>trippin&apos; travels</span>
    </span>
  );
}
