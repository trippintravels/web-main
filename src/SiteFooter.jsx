import { FOOTER, LIVE_REGIONS, CONTACT_EMAIL } from './data.js';
import InstagramLink from './InstagramLink.jsx';
import Logo from './Logo.jsx';
import { slugify } from './route.js';

// Shared site footer used by every page. The brand block (tagline + Instagram)
// mirrors the original desktop footer; layout collapses to a stacked / 2-col
// grid on mobile. "our story" links scroll to the story-page sections.
export default function SiteFooter({ isDesktop, onStory, onHome, onRegion }) {
  const brand = (
    <div>
      {/* The mark sits beside the script wordmark rather than the Cinzel one used
          in the nav, so it's sized to that. `.script` carries a negative left
          margin (the Pinyon ink fix), which eats into a flex gap — hence the
          explicit padding on the logo instead of relying on `gap` alone. */}
      <div
        onClick={onHome}
        style={{
          display: 'flex', alignItems: 'center',
          color: 'var(--oat)', cursor: onHome ? 'pointer' : 'default',
        }}
      >
        <Logo size={isDesktop ? 42 : 32} style={{ marginRight: isDesktop ? 22 : 16 }} />
        <span className="script" style={{ fontSize: isDesktop ? 52 : 38, lineHeight: 1 }}>
          trippin&apos; travels
        </span>
      </div>
      <div style={{ marginTop: isDesktop ? 20 : 14, font: "300 13px/1.6 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.6)', maxWidth: 260 }}>
        go beyond the trails
      </div>
      <InstagramLink style={{ marginTop: 22 }} />
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        style={{ display: 'block', width: 'fit-content', marginTop: 16, font: "300 13px 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.72)', textDecoration: 'none' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--oat)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(231,220,203,.72)')}
      >
        {CONTACT_EMAIL}
      </a>
    </div>
  );

  const cols = (
    <>
      <FooterCol
        title="expeditions"
        items={FOOTER.expeditions}
        onItem={onRegion && ((x) => LIVE_REGIONS.has(slugify(x)) && onRegion(slugify(x)))}
        isLive={(x) => LIVE_REGIONS.has(slugify(x))}
      />
      <FooterCol title="experiences" items={FOOTER.experiences} />
      <FooterCol title="tours & rentals" items={FOOTER.toursRentals} />
      <FooterCol title="our story" items={FOOTER.story} onItem={(x) => onStory(slugify(x))} />
    </>
  );

  return (
    <footer style={{ background: 'var(--bark-deep)', color: 'var(--sand)', padding: isDesktop ? '60px 72px 44px' : '44px 26px 38px', textAlign: 'left' }}>
      {isDesktop ? (
        // Four link columns, not three: the brand column has to hold the script
        // wordmark on one line or it breaks across "trippin'" / "travels", so it
        // takes 2fr and the gap tightens to 32. Measured — at 1.4fr/40 the
        // wordmark wrapped from 1440px all the way down.
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 32 }}>
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
        © 2026 trippin' travels
      </div>
    </footer>
  );
}

// `isLive` lets a column mark only some of its items as navigable — expedition
// regions become clickable one at a time as their pages ship.
function FooterCol({ title, items, onItem, isLive }) {
  return (
    <div>
      <div style={{ font: "600 10px 'Hanken Grotesk', sans-serif", letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--clay-light)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, font: "300 12.5px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.72)' }}>
        {items.map((x) => {
          const live = onItem && (!isLive || isLive(x));
          return (
            <span key={x} onClick={live ? () => onItem(x) : undefined} style={{ cursor: live ? 'pointer' : 'default' }}>{x}</span>
          );
        })}
      </div>
    </div>
  );
}
