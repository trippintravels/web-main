import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import BackLink from './BackLink.jsx';
import MobileTopBar from './MobileTopBar.jsx';
import { OFFBEAT } from './offbeat.js';

const HERO_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.14) 30%,rgba(20,16,12,.74))';

// Doc copy arrives as an array of paragraphs — one <p> each, like ZonePage.
function Paras({ items, style, gap = 14 }) {
  return items.map((t, i) => (
    <p key={i} style={{ margin: i ? `${gap}px 0 0` : 0, ...style }}>{t}</p>
  ));
}

// Level 3 — a single offbeat hamlet. There is one paragraph of copy per hamlet,
// so this stays a deliberately quiet page: hero, the coordinates line, the doc
// paragraph, then a plan CTA. A prev/next strip lets you wander the register
// sideways without climbing back up to level 2. The script title is lowercased
// like every heading on the site — Great Vibes' ornamental capitals rise into
// the breadcrumb above, and lowercase keeps the tight-leading hero clean.
export default function HamletPage({ hamlet, isDesktop, onHome, onMenu, onStory, onRegion, onHamlet, onPlan }) {
  const px = isDesktop ? 72 : 26;

  // prev / next wrap around the register, so the scatter reads as a loop rather
  // than a list with two dead ends.
  const list = OFFBEAT.hamlets;
  const i = list.findIndex((h) => h.slug === hamlet.slug);
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];

  return (
    <div style={{ background: 'var(--oat)', position: 'relative', overflow: 'hidden' }}>
      {/* HERO */}
      <div style={{ position: 'relative' }}>
        <PhotoFrame img={hamlet.img} overlay={HERO_OVERLAY} drift={isDesktop ? 80 : 40} float={0} focus="center 45%" style={{ height: isDesktop ? 560 : 460 }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${isDesktop ? 38 : 46}px ${px}px ${isDesktop ? 54 : 44}px` }}>
            {/* breadcrumb up to the offbeat register; only the parent links */}
            <Reveal style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              <BackLink onClick={() => onRegion(OFFBEAT.slug)} tone="dark" label={OFFBEAT.name} />
              <span className="eyebrow" style={{ letterSpacing: '.26em', color: 'rgba(241,235,224,.55)' }}>
                / {hamlet.name.toLowerCase()}
              </span>
            </Reveal>
            <Reveal className="script" delay={150} style={{ fontSize: isDesktop ? 116 : 62, lineHeight: .86, color: 'var(--cream)', marginTop: 4 }}>
              {hamlet.name.toLowerCase()}
            </Reveal>
            <Reveal as="p" delay={300} style={{ margin: '14px 0 0', font: "400 12px ui-monospace, Menlo, monospace", letterSpacing: '.06em', color: 'rgba(246,241,231,.75)' }}>
              {hamlet.coord}
            </Reveal>
          </div>
        </PhotoFrame>

        {isDesktop ? (
          <DesktopNav onStory={onStory} onWordmark={onHome} onRegion={onRegion} />
        ) : (
          <MobileTopBar floating onHome={onHome} onMenu={onMenu} />
        )}
      </div>

      {/* THE HAMLET */}
      <div style={{ padding: `${isDesktop ? 72 : 44}px ${px}px ${isDesktop ? 76 : 48}px`, maxWidth: 900 }}>
        <Reveal className="eyebrow" style={{ letterSpacing: '.26em' }}>the hideout</Reveal>
        <Reveal delay={150} style={{ marginTop: 18 }}>
          <Paras
            items={hamlet.body}
            style={{ font: `300 ${isDesktop ? 18 : 16}px/1.75 'Hanken Grotesk', sans-serif`, color: 'var(--ink)', textWrap: 'pretty' }}
          />
        </Reveal>
      </div>

      {/* PREV / NEXT — wander the register sideways */}
      <div style={{ background: 'var(--sand)', padding: `${isDesktop ? 34 : 26}px ${px}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <button type="button" className="back-link" onClick={() => onHamlet(prev.slug)} style={{ '--bl-color': 'rgba(41,33,28,.55)', '--bl-hover': 'var(--bark)', '--bl-rule': 'rgba(41,33,28,.3)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 6 5 12 11 18" />
          </svg>
          <span className="bl-label">{prev.name}</span>
        </button>
        {/* the same nudging link, mirrored — arrow on the right */}
        <button type="button" className="back-link back-link-fwd" onClick={() => onHamlet(next.slug)} style={{ '--bl-color': 'rgba(41,33,28,.55)', '--bl-hover': 'var(--bark)', '--bl-rule': 'rgba(41,33,28,.3)' }}>
          <span className="bl-label">{next.name}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </button>
      </div>

      {/* PLAN CTA */}
      <div style={{ background: 'var(--bark)', padding: `${isDesktop ? 84 : 56}px ${px}px`, textAlign: 'center' }}>
        <Reveal className="script" style={{ fontSize: isDesktop ? 64 : 42, color: 'var(--cream)', lineHeight: .95 }}>
          plan {hamlet.name.toLowerCase()}
        </Reveal>
        <Reveal as="p" delay={150} style={{ margin: '16px auto 0', maxWidth: 460, font: `300 ${isDesktop ? 16 : 14.5}px/1.6 'Hanken Grotesk', sans-serif`, color: 'rgba(231,220,203,.8)', textTransform: 'lowercase' }}>
          we'll thread {hamlet.name.toLowerCase()} into an unhurried route through the hills around it.
        </Reveal>
        <Reveal delay={300} style={{ marginTop: 28 }}>
          <button
            className="pill"
            onClick={() => onPlan({ where: OFFBEAT.slug, message: `tell me about ${hamlet.name}` })}
            style={{ font: "500 13px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '16px 34px' }}
          >
            send an enquiry
          </button>
        </Reveal>
      </div>

      <SiteFooter isDesktop={isDesktop} onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
