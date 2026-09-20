import { useState } from 'react';
import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import BackLink from './BackLink.jsx';
import MobileTopBar from './MobileTopBar.jsx';
import OffbeatMap from './OffbeatMap.jsx';
import { OFFBEAT } from './offbeat.js';

const HERO_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.16) 30%,rgba(20,16,12,.72))';

// Level 2 — offbeat & unexplored. The odd region out: it isn't carved into
// zones, so instead of RegionPage's map-beside-a-zone-index it is a pinned
// field map over a "quiet register" of every hamlet. The pins and the index
// are two readings of the same list — hovering either lights both — so they
// share one `active` (the hovered hamlet's `n`), and both open the hamlet's
// level-3 page (`onHamlet`).
export default function OffbeatPage({ isDesktop, onHome, onMenu, onStory, onRegion, onHamlet, onPlan }) {
  const [active, setActive] = useState(null);
  const px = isDesktop ? 72 : 26;
  const { hamlets } = OFFBEAT;

  return (
    <div style={{ background: 'var(--oat)', position: 'relative', overflow: 'hidden' }}>
      {/* HERO */}
      <div style={{ position: 'relative' }}>
        <PhotoFrame img={OFFBEAT.heroImg} overlay={HERO_OVERLAY} drift={isDesktop ? 80 : 40} float={0} focus="center 45%" style={{ height: isDesktop ? 460 : 400 }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${isDesktop ? 38 : 46}px ${px}px ${isDesktop ? 50 : 40}px` }}>
            {/* the eyebrow is the way back up a level — see ZonePage for why the
                z-index sits on the Reveal, not the button */}
            <Reveal style={{ position: 'relative', zIndex: 2 }}>
              <BackLink onClick={onHome} tone="dark" label={`destinations – ${OFFBEAT.num}`} />
            </Reveal>
            <Reveal className="script" delay={150} style={{ fontSize: isDesktop ? 96 : 52, lineHeight: .82, color: 'var(--cream)', marginTop: 6, maxWidth: 780 }}>
              {OFFBEAT.name}
            </Reveal>
            <Reveal as="p" delay={300} style={{ margin: '18px 0 0', maxWidth: 560, font: `300 ${isDesktop ? 18 : 14}px/1.55 'Hanken Grotesk', sans-serif`, color: 'rgba(246,241,231,.9)', textWrap: 'pretty' }}>
              {OFFBEAT.intro}
            </Reveal>
          </div>
        </PhotoFrame>

        {isDesktop ? (
          <DesktopNav onStory={onStory} onWordmark={onHome} onRegion={onRegion} />
        ) : (
          <MobileTopBar floating onHome={onHome} onMenu={onMenu} />
        )}
      </div>

      {/* MAP — heading + legend, then the pinned field map */}
      <div style={{ padding: `${isDesktop ? 60 : 34}px ${px}px ${isDesktop ? 24 : 12}px` }}>
        <div style={{ display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <div>
            <Reveal className="eyebrow" style={{ letterSpacing: '.26em' }}>the scattered hamlets</Reveal>
            <Reveal className="script" delay={150} style={{ fontSize: isDesktop ? 52 : 40, color: 'var(--bark)', lineHeight: .9, marginTop: 6 }}>
              find your hideout
            </Reveal>
          </div>
          <Reveal delay={isDesktop ? 300 : 0} style={{ display: 'flex', flexWrap: 'wrap', gap: isDesktop ? '10px 24px' : '10px 18px', marginTop: isDesktop ? 0 : 14, font: `400 ${isDesktop ? 11 : 10}px 'Hanken Grotesk', sans-serif`, letterSpacing: '.04em', color: 'rgba(41,33,28,.55)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="of-key of-key-bengal" />west bengal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="of-key of-key-sikkim" />sikkim</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="of-key of-key-pin" />hamlet</span>
          </Reveal>
        </div>

        <Reveal delay={150} style={{ display: 'grid', justifyItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: 720, marginTop: isDesktop ? 8 : 6 }}>
            <OffbeatMap
              hamlets={hamlets}
              active={active}
              onHover={setActive}
              onPick={onHamlet}
              label="map of offbeat hamlets across sikkim and north bengal"
            />
          </div>
        </Reveal>
      </div>

      {/* THE QUIET REGISTER — the field index */}
      <div style={{ padding: `${isDesktop ? 8 : 6}px ${px}px ${isDesktop ? 60 : 40}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, borderTop: '1px solid rgba(41,33,28,.14)', paddingTop: isDesktop ? 24 : 14 }}>
          <Reveal className="script" style={{ fontSize: isDesktop ? 48 : 34, color: 'var(--bark)', lineHeight: .9 }}>
            the quiet register
          </Reveal>
          <Reveal className="eyebrow" delay={150} style={{ letterSpacing: '.22em', fontSize: isDesktop ? 11 : 9, textAlign: 'right' }}>
            {hamlets.length} hamlets{isDesktop ? ' · west bengal & sikkim' : ''}
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: isDesktop ? '0 56px' : 0, marginTop: 4 }}>
          {hamlets.map((h, i) => (
            <Reveal
              key={h.n}
              delay={isDesktop ? (i % 2) * 90 : 0}
              role="link"
              tabIndex={0}
              aria-label={h.name}
              onClick={() => onHamlet(h.slug)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onHamlet(h.slug))}
              onMouseEnter={() => setActive(h.n)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(h.n)}
              onBlur={() => setActive(null)}
              className="of-row"
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                padding: '16px 0',
                borderTop: '1px solid rgba(41,33,28,.14)',
                cursor: 'pointer',
                background: active === h.n ? 'rgba(169,103,76,.08)' : 'transparent',
                transition: 'background .25s ease',
              }}
            >
              <div style={{ font: "600 12px ui-monospace, Menlo, monospace", color: 'rgba(41,33,28,.35)', width: 22, flex: 'none' }}>{h.n}</div>
              <div
                className="of-thumb"
                role="img"
                aria-label={h.name}
                style={{ backgroundImage: `linear-gradient(rgba(20,16,12,.1),rgba(20,16,12,.3)),url('${h.img}')` }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="script" style={{ fontSize: 30, color: 'var(--bark)', lineHeight: .9 }}>{h.name}</div>
                <div style={{ font: "400 9px ui-monospace, Menlo, monospace", color: 'rgba(41,33,28,.45)', letterSpacing: '.03em', marginTop: 3 }}>{h.coord}</div>
                <div style={{ font: "300 12.5px/1.4 'Hanken Grotesk', sans-serif", color: 'rgba(41,33,28,.6)', marginTop: 4, textWrap: 'pretty' }}>{h.blurb}</div>
              </div>
              <span className="of-arrow" style={{ flex: 'none', color: 'var(--clay)', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </span>
            </Reveal>
          ))}
        </div>
      </div>

      {/* PLAN CTA */}
      <div style={{ background: 'var(--bark)', padding: `${isDesktop ? 66 : 48}px ${px}px`, textAlign: 'center' }}>
        <Reveal className="script" style={{ fontSize: isDesktop ? 60 : 42, color: 'var(--cream)', lineHeight: .9 }}>
          plan an offbeat trail
        </Reveal>
        <Reveal as="p" delay={150} style={{ margin: '14px auto 0', maxWidth: 460, font: `300 ${isDesktop ? 16 : 14}px/1.6 'Hanken Grotesk', sans-serif`, color: 'rgba(241,235,224,.72)', textWrap: 'pretty' }}>
          tell us how many days you have — we'll thread these hamlets into one unhurried route.
        </Reveal>
        <Reveal delay={300} style={{ marginTop: 26 }}>
          <button
            className="pill"
            onClick={() => onPlan({ where: OFFBEAT.slug, message: 'plan an offbeat trail' })}
            style={{ font: "500 13px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '15px 32px' }}
          >
            send an enquiry
          </button>
        </Reveal>
      </div>

      <SiteFooter isDesktop={isDesktop} onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
