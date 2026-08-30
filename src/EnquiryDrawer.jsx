import { useEffect } from 'react';
import EnquiryForm from './EnquiryForm.jsx';

export default function EnquiryDrawer({ open, onClose, prefill }) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
          tell us where your mind wanders – we'll shape the rest.
        </p>

        <EnquiryForm fill collapse={!open} prefill={prefill} style={{ marginTop: 40 }} />

      </aside>
    </div>
  );
}
