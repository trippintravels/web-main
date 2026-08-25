import { FOOTER } from './data.js';
import { slugify } from './route.js';

// Shared site footer used by every page. The brand block (tagline + Instagram)
// mirrors the original desktop footer; layout collapses to a stacked / 2-col
// grid on mobile. "our story" links scroll to the story-page sections.
export default function SiteFooter({ isDesktop, onStory, onHome }) {
  const brand = (
    <div>
      <div className="script" onClick={onHome} style={{ fontSize: isDesktop ? 52 : 38, color: 'var(--oat)', lineHeight: 1, cursor: onHome ? 'pointer' : 'default' }}>
        trippin' travels
      </div>
      <div style={{ marginTop: isDesktop ? 20 : 14, font: "300 13px/1.6 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.6)', maxWidth: 260 }}>
        bespoke journeys through the eastern himalaya. made for you, only.
      </div>
      <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ marginTop: 22, display: 'inline-flex', width: 30, height: 30, color: 'var(--sand)' }} aria-label="instagram">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </div>
  );

  const cols = (
    <>
      <FooterCol title="expeditions" items={FOOTER.expeditions} />
      <FooterCol title="tours & rentals" items={FOOTER.toursRentals} />
      <FooterCol title="our story" items={FOOTER.story} onItem={(x) => onStory(slugify(x))} />
    </>
  );

  return (
    <footer style={{ background: 'var(--bark-deep)', color: 'var(--sand)', padding: isDesktop ? '60px 72px 44px' : '44px 26px 38px', textAlign: 'left' }}>
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40 }}>
          {brand}
          {cols}
        </div>
      ) : (
        <>
          {brand}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 20px', marginTop: 30 }}>
            {cols}
          </div>
        </>
      )}
      <div className="mono" style={{ marginTop: isDesktop ? 44 : 30, font: '400 10px ui-monospace, Menlo, monospace', color: 'rgba(231,220,203,.4)', textTransform: 'lowercase' }}>
        © 2026 trippin' travels · eastern himalaya
      </div>
    </footer>
  );
}

function FooterCol({ title, items, onItem }) {
  return (
    <div>
      <div style={{ font: "600 10px 'Hanken Grotesk', sans-serif", letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--clay-light)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, font: "300 12.5px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.72)' }}>
        {items.map((x) => (
          <span key={x} onClick={onItem ? () => onItem(x) : undefined} style={{ cursor: onItem ? 'pointer' : 'default' }}>{x}</span>
        ))}
      </div>
    </div>
  );
}
