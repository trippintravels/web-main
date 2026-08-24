import { useState, useEffect } from 'react';
import { INTENT_OPTIONS } from './data.js';

export default function EnquiryDrawer({ open, onClose }) {
  const [ddOpen, setDdOpen] = useState(false);
  const [intent, setIntent] = useState(null); // null | INTENT_OPTIONS item

  // reset transient state whenever the drawer closes
  useEffect(() => {
    if (!open) setDdOpen(false);
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const intentText = intent ? intent.label : 'what are you planning?';
  const intentColor = intent ? 'var(--bark)' : 'rgba(41,33,28,.4)';
  const chev = ddOpen ? '▲' : '▾';

  return (
    <div className={`drawer${open ? ' on' : ''}`} aria-hidden={!open}>
      <div className="scrim" onClick={onClose} />
      <aside
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Plan your journey"
        style={{ padding: '60px 44px 44px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="script" style={{ fontSize: 46, color: 'var(--bark)', lineHeight: 1 }}>
            plan your journey
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              font: "400 26px 'Hanken Grotesk', sans-serif",
              color: 'var(--ink)', background: 'none', border: 0, cursor: 'pointer', lineHeight: 1,
            }}
          >×</button>
        </div>

        <p style={{ margin: '14px 0 0', font: "300 14px/1.5 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(41,33,28,.55)' }}>
          tell us where your mind wanders — we'll shape the rest.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 30, marginTop: 40 }}>
          <input className="uline" placeholder="your name" />
          <input className="uline" placeholder="email" />

          {/* intent dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              className="uline"
              role="button"
              tabIndex={0}
              onClick={() => setDdOpen((v) => !v)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDdOpen((v) => !v)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: intentColor }}
            >
              {intentText}
              <span style={{ fontSize: 12, color: 'var(--clay)' }}>{chev}</span>
            </div>
            {ddOpen && (
              <div
                style={{
                  position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)',
                  background: 'var(--cream)', border: '1px solid rgba(41,33,28,.12)',
                  borderRadius: 10, boxShadow: '0 18px 36px -18px rgba(41,33,28,.5)',
                  zIndex: 6, overflow: 'hidden', animation: 'fadeIn .18s ease',
                }}
              >
                {INTENT_OPTIONS.map((opt, i) => (
                  <div
                    key={opt.key}
                    onClick={() => { setIntent(opt); setDdOpen(false); }}
                    style={{
                      padding: '15px 18px',
                      font: "400 15px 'Hanken Grotesk', sans-serif",
                      textTransform: 'lowercase', color: 'var(--bark)', cursor: 'pointer',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(41,33,28,.08)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#ece3d3')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input className="uline" placeholder="tell us your dream trip" />
        </div>

        <button
          className="pill"
          style={{ marginTop: 'auto', font: "500 14px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: 17 }}
        >
          send enquiry
        </button>
      </aside>
    </div>
  );
}
