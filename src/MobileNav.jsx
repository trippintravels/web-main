import { useEffect } from 'react';
import { NAV, LIVE_REGIONS, INSTAGRAM_URL } from './data.js';
import { slugify } from './route.js';
import Brandmark from './Brandmark.jsx';

const link = {
  cursor: 'pointer',
  transition: 'color .2s ease',
};

function Group({ items, onItem }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 14, font: "300 14px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.75)' }}>
      {items.map((x) => (
        <span
          key={x}
          style={link}
          onClick={onItem ? () => onItem(x) : undefined}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(231,220,203,.75)')}
        >{x}</span>
      ))}
    </div>
  );
}

export default function MobileNav({ open, onClose, onPlan, onStory, onHome, onRegion }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`navov${open ? ' on' : ''}`} aria-hidden={!open}>
      <div style={{ padding: '46px 26px 40px', minHeight: '100%', boxSizing: 'border-box', color: 'var(--sand)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
          <Brandmark onClick={onHome} />
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, background: 'none', border: 0, cursor: 'pointer', color: 'var(--clay-light)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="2" y1="2" x2="20" y2="20" />
              <line x1="20" y1="2" x2="2" y2="20" />
            </svg>
          </button>
        </div>

        <div style={{ marginTop: 38, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <div className="script" style={{ fontSize: 38, color: 'var(--oat)', lineHeight: .9 }}>expeditions</div>
            {/* only regions with a page built are tappable */}
            <Group
              items={NAV.expeditions}
              onItem={onRegion && ((x) => LIVE_REGIONS.has(slugify(x)) && onRegion(slugify(x)))}
            />
          </div>

          <div>
            <div className="script" style={{ fontSize: 38, color: 'var(--oat)', lineHeight: .9 }}>tours &amp; rentals</div>
            <div style={{ marginTop: 14, font: "400 10px ui-monospace, Menlo, monospace", color: 'var(--clay-light)', textTransform: 'lowercase' }}>tours</div>
            <Group items={NAV.tours} />
            <div style={{ marginTop: 14, font: "400 10px ui-monospace, Menlo, monospace", color: 'var(--clay-light)', textTransform: 'lowercase' }}>rentals</div>
            <Group items={NAV.rentals} />
          </div>

          <div>
            <div className="script" style={{ fontSize: 38, color: 'var(--oat)', lineHeight: .9, cursor: 'pointer' }} onClick={() => onStory('')}>our story</div>
            <Group items={NAV.story} onItem={(x) => onStory(slugify(x))} />
          </div>
        </div>

        <button
          className="pill"
          onClick={onPlan}
          style={{ alignSelf: 'flex-start', marginTop: 40, font: "500 12px 'Hanken Grotesk', sans-serif", color: 'var(--bark-deep)', background: 'var(--clay-light)', padding: '14px 28px' }}
        >
          plan your journey
        </button>

        {/* instagram + email pinned to the bottom-right corner */}
        <div style={{ marginTop: 'auto', paddingTop: 44, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', width: 28, height: 28, color: 'var(--sand)' }} aria-label="instagram">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="mailto:hey@trippintravels.in"
            style={{ font: "300 13px 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.72)', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--oat)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(231,220,203,.72)')}
          >
            hey@trippintravels.in
          </a>
        </div>
      </div>
    </div>
  );
}
