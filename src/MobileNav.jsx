import { useEffect } from 'react';
import { NAV } from './data.js';

const link = {
  cursor: 'pointer',
  transition: 'color .2s ease',
};

function Group({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 14, font: "300 14px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.75)' }}>
      {items.map((x) => (
        <span
          key={x}
          style={link}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(231,220,203,.75)')}
        >{x}</span>
      ))}
    </div>
  );
}

export default function MobileNav({ open, onClose, onPlan }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`navov${open ? ' on' : ''}`} aria-hidden={!open}>
      <div style={{ padding: '46px 26px 40px', minHeight: '100%', boxSizing: 'border-box', color: 'var(--sand)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
          <span style={{ font: "600 12px 'Hanken Grotesk', sans-serif", letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--oat)' }}>
            trippin travels
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ font: "400 24px 'Hanken Grotesk', sans-serif", color: 'var(--clay-light)', background: 'none', border: 0, cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>

        <div style={{ marginTop: 38, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <div className="script" style={{ fontSize: 38, color: 'var(--oat)', lineHeight: .9 }}>expeditions</div>
            <Group items={NAV.expeditions} />
          </div>

          <div>
            <div className="script" style={{ fontSize: 38, color: 'var(--oat)', lineHeight: .9 }}>tours &amp; rentals</div>
            <div style={{ marginTop: 14, font: "400 10px ui-monospace, Menlo, monospace", color: 'var(--clay-light)', textTransform: 'lowercase' }}>tours</div>
            <Group items={NAV.tours} />
            <div style={{ marginTop: 14, font: "400 10px ui-monospace, Menlo, monospace", color: 'var(--clay-light)', textTransform: 'lowercase' }}>rentals</div>
            <Group items={NAV.rentals} />
          </div>

          <div>
            <div className="script" style={{ fontSize: 38, color: 'var(--oat)', lineHeight: .9 }}>our story</div>
            <Group items={NAV.story} />
          </div>
        </div>

        <button
          className="pill"
          onClick={onPlan}
          style={{ marginTop: 40, font: "500 12px 'Hanken Grotesk', sans-serif", color: 'var(--bark-deep)', background: 'var(--clay-light)', padding: '14px 28px' }}
        >
          plan your journey
        </button>
      </div>
    </div>
  );
}
