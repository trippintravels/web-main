import { useState } from 'react';
import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import ZoneMap from './ZoneMap.jsx';

// Heroes carry type at the bottom edge, so weight the gradient there — keeps the
// eyebrow and title legible whatever photograph ends up behind them.
const HERO_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.14) 30%,rgba(20,16,12,.74))';

// Level 2 — a region landing: the map is the subject, with a zone index beside
// it (desktop) or below it (mobile). Hovering either the map or a list row
// lights up both, so the two readings of the same four zones stay tied together.
//
// Per the reference, mobile skips the hero photo entirely: the map is the hero
// there, and a full-bleed photo would push it below the fold.
export default function RegionPage({ region, map, isDesktop, onHome, onMenu, onStory, onRegion, onZone }) {
  const [hover, setHover] = useState(null);
  const px = isDesktop ? 72 : 26;

  const zones = region.zones.map((z) => ({ ...map[z.slug], ...z }));

  const title = (dark) => (
    <>
      <Reveal
        className="eyebrow"
        style={{ letterSpacing: '.26em', color: dark ? 'var(--clay-light)' : 'rgba(41,33,28,.5)' }}
      >
        destinations — {region.num}
      </Reveal>
      <Reveal
        className="script"
        delay={150}
        style={{
          fontSize: isDesktop ? 104 : 56,
          lineHeight: .86,
          color: dark ? 'var(--cream)' : 'var(--bark)',
          marginTop: 6,
        }}
      >
        {region.name}
      </Reveal>
    </>
  );

  return (
    <div style={{ background: 'var(--oat)', position: 'relative', overflow: 'hidden' }}>
      {isDesktop ? (
        <div style={{ position: 'relative' }}>
          <PhotoFrame img={region.heroImg} overlay={HERO_OVERLAY} drift={80} float={0} focus="center 40%" style={{ height: 520 }}>
            <div className="phcap">{region.name} · the hills</div>
            <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `38px ${px}px 54px` }}>
              {title(true)}
            </div>
          </PhotoFrame>
          <DesktopNav onStory={onStory} onWordmark={onHome} onRegion={onRegion} />
        </div>
      ) : (
        <div style={{ padding: `46px ${px}px 0` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
            <span className="wordmark" onClick={onHome} style={{ fontSize: 17, color: 'var(--bark)', cursor: 'pointer' }}>
              trippin' travels
            </span>
            <button onClick={onMenu} aria-label="Open menu" style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', background: 'none', border: 0, padding: 4 }}>
              <span style={{ width: 22, height: 1.5, background: 'var(--bark)' }} />
              <span style={{ width: 22, height: 1.5, background: 'var(--bark)' }} />
            </button>
          </div>
          <div style={{ marginTop: 30 }}>{title(false)}</div>
        </div>
      )}

      {/* MAP + ZONE INDEX */}
      <div
        style={{
          padding: `${isDesktop ? 64 : 26}px ${px}px ${isDesktop ? 76 : 48}px`,
          display: isDesktop ? 'grid' : 'block',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined,
          gap: 64,
          alignItems: 'center',
        }}
      >
        <Reveal>
          <ZoneMap
            viewBox={map.viewBox}
            zones={zones}
            active={hover}
            onPick={onZone}
            label={`clickable zone map of ${region.name}`}
          />
        </Reveal>

        <div style={{ marginTop: isDesktop ? 0 : 30 }}>
          {isDesktop && (
            <>
              <Reveal className="eyebrow" style={{ letterSpacing: '.26em' }}>choose your corner</Reveal>
              <Reveal as="p" delay={150} style={{ margin: '14px 0 30px', font: "300 21px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textWrap: 'pretty' }}>
                {region.intro}
              </Reveal>
            </>
          )}
          {!isDesktop && (
            <Reveal className="eyebrow" style={{ letterSpacing: '.24em', marginBottom: 10 }}>or pick from the list</Reveal>
          )}

          <div style={{ borderTop: '1px solid rgba(41,33,28,.14)' }}>
            {zones.map((z, i) => (
              <Reveal
                key={z.slug}
                delay={i * 90}
                role="link"
                tabIndex={0}
                onClick={() => onZone(z.slug)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onZone(z.slug))}
                onMouseEnter={() => setHover(z.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(z.slug)}
                onBlur={() => setHover(null)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 20,
                  padding: `${isDesktop ? 20 : 18}px ${isDesktop ? 22 : 0}px`,
                  marginLeft: isDesktop ? -22 : 0,
                  marginRight: isDesktop ? -22 : 0,
                  borderBottom: '1px solid rgba(41,33,28,.14)',
                  cursor: 'pointer',
                  background: hover === z.slug ? 'rgba(169,103,76,.08)' : 'transparent',
                  transition: 'background .25s ease',
                }}
              >
                <div>
                  <div style={{ font: `500 ${isDesktop ? 21 : 18}px 'Hanken Grotesk', sans-serif`, color: 'var(--bark)' }}>
                    {z.name}
                  </div>
                  <div style={{ marginTop: 6, font: `300 ${isDesktop ? 14.5 : 13}px/1.55 'Hanken Grotesk', sans-serif`, color: 'rgba(41,33,28,.55)', textWrap: 'pretty' }}>
                    {z.blurb}
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--clay)', font: "500 14px 'Hanken Grotesk', sans-serif", whiteSpace: 'nowrap', paddingTop: 2 }}>
                  {z.count}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter isDesktop={isDesktop} onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
