import Brandmark from './Brandmark.jsx';

// The mobile wordmark + hamburger strip, drawn by every page below 900px.
//
// The geometry is fixed here rather than passed in, for the same reason
// Brandmark exists at all: MobileNav's overlay redraws the brand on top of
// whatever is underneath, and the swap only reads as a panel opening if the two
// lockups land on exactly the same point. 46px from the top, a 26px gutter and a
// 24px row — matching the overlay's own `46px 26px` padding. Don't parameterise
// them; move both together or neither.
//
// `floating` lifts the bar over a full-bleed hero photograph. Without it the bar
// is a plain row, for pages whose own container already carries the padding —
// the home hero's stack, and the region page, which has no mobile hero photo and
// so runs the bar in normal flow on the page ground (hence `color`).

const GUTTER = 26;

export default function MobileTopBar({ onHome, onMenu, color = 'var(--oat)', floating = false }) {
  const row = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
      <Brandmark onClick={onHome} color={color} />
      <button
        onClick={onMenu}
        aria-label="Open menu"
        style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', background: 'none', border: 0, padding: 4 }}
      >
        <span style={{ width: 22, height: 1.5, background: color }} />
        <span style={{ width: 22, height: 1.5, background: color }} />
      </button>
    </div>
  );

  if (!floating) return row;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: `46px ${GUTTER}px 20px` }}>
      {row}
    </div>
  );
}
