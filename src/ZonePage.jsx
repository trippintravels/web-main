import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import BackLink from './BackLink.jsx';
import MobileTopBar from './MobileTopBar.jsx';

const HERO_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.14) 30%,rgba(20,16,12,.74))';

// Doc copy arrives as an array of paragraphs — render each as its own <p> so
// the spacing between them is real, not a run-on block.
function Paras({ items, style, gap = 12 }) {
  return items.map((t, i) => (
    <p key={i} style={{ margin: i ? `${gap}px 0 0` : 0, ...style }}>{t}</p>
  ));
}

// Level 3 — a zone: hero, the zone intro, then one photo + text card per sight.
// Desktop lifts the intro into the hero (9b); mobile drops it into the band
// below (8b). Some zones close with a featured "special mention" band before
// the enquiry CTA.
//
// The top bar carries the wordmark on every page, sub-pages included — the way
// back up a level is the region half of the eyebrow, not a bar-level arrow.
export default function ZonePage({ region, zone, isDesktop, onHome, onMenu, onStory, onRegion, onPlan }) {
  const px = isDesktop ? 72 : 26;
  const total = zone.count;

  // Desktop uses the opening paragraph as the hero standfirst (per 9b) and
  // carries the rest into the band below; mobile keeps the whole intro there.
  const heroIntro = isDesktop ? zone.intro.slice(0, 1) : [];
  const bandIntro = isDesktop ? zone.intro.slice(1) : zone.intro;

  return (
    <div style={{ background: 'var(--oat)', position: 'relative', overflow: 'hidden' }}>
      {/* HERO */}
      <div style={{ position: 'relative' }}>
        {/* no phcap here — the eyebrow below already reads "region / zone", and on
            mobile a caption crowds the script title's descenders */}
        <PhotoFrame img={zone.heroImg} overlay={HERO_OVERLAY} drift={isDesktop ? 80 : 40} float={0} focus="center 42%" style={{ height: isDesktop ? 560 : 460 }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${isDesktop ? 38 : 46}px ${px}px ${isDesktop ? 54 : 44}px` }}>
            {/* breadcrumb: only the parent is a link — the page you're on isn't */}
            {/* Lifted above the title: the script face below uses line-height < 1,
                so its glyphs overflow upward and would otherwise eat the click.
                The z-index has to sit here — each Reveal is its own stacking
                context, so one on the button itself never escapes. */}
            <Reveal style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              <BackLink onClick={() => onRegion(region.slug)} tone="dark" label={region.name} />
              <span
                className="eyebrow"
                style={{ letterSpacing: '.26em', color: 'rgba(241,235,224,.55)' }}
              >
                / {zone.name.toLowerCase()}
              </span>
            </Reveal>
            <Reveal className="script" delay={150} style={{ fontSize: isDesktop ? 116 : 60, lineHeight: .86, color: 'var(--cream)', marginTop: 4 }}>
              {zone.name.toLowerCase()}
            </Reveal>
            {heroIntro.length > 0 && (
              <Reveal delay={300} style={{ marginTop: 18, maxWidth: 620 }}>
                <Paras items={heroIntro} style={{ font: "300 17px/1.6 'Hanken Grotesk', sans-serif", color: 'rgba(246,241,231,.9)', textWrap: 'pretty' }} />
              </Reveal>
            )}
          </div>
        </PhotoFrame>

        {/* top bar — wordmark + hamburger on mobile, nav over the hero on desktop */}
        {isDesktop ? (
          <DesktopNav onStory={onStory} onWordmark={onHome} onRegion={onRegion} />
        ) : (
          <MobileTopBar floating onHome={onHome} onMenu={onMenu} />
        )}
      </div>

      {/* INTRO (mobile) + SIGHTS */}
      <div style={{ padding: `${isDesktop ? 72 : 40}px ${px}px ${isDesktop ? 76 : 48}px` }}>
        {bandIntro.length > 0 && (
          <Reveal style={{ marginBottom: isDesktop ? 52 : 36, maxWidth: isDesktop ? 900 : undefined }}>
            <Paras
              items={bandIntro}
              gap={isDesktop ? 14 : 12}
              style={{ font: `300 ${isDesktop ? 16.5 : 16}px/1.7 'Hanken Grotesk', sans-serif`, color: 'var(--ink)', textWrap: 'pretty' }}
            />
          </Reveal>
        )}

        <div style={{ display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: isDesktop ? 34 : 22 }}>
          <Reveal className="script" style={{ fontSize: isDesktop ? 56 : 40, color: 'var(--bark)', lineHeight: .9 }}>
            the sights
          </Reveal>
          <Reveal className="eyebrow" delay={150} style={{ letterSpacing: '.24em', marginTop: isDesktop ? 0 : 12, paddingBottom: isDesktop ? 8 : 0 }}>
            {total} places · {zone.name.toLowerCase()} &amp; around
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: `${isDesktop ? 48 : 34}px 56px` }}>
          {zone.sights.map((s, i) => (
            <Reveal key={s.n} delay={(i % 2) * 120}>
              <PhotoFrame img={s.img} drift={40} float={0} style={{ height: isDesktop ? 260 : 220, borderRadius: 4 }}>
                <div className="phcap">{s.n} · {s.cap}</div>
              </PhotoFrame>
              <div className="script" style={{ fontSize: isDesktop ? 34 : 30, color: 'var(--bark)', lineHeight: 1, margin: '16px 0 0' }}>
                {s.name}
              </div>
              <div style={{ marginTop: 10 }}>
                <Paras items={s.body} gap={10} style={{ font: `300 ${isDesktop ? 14.5 : 14}px/1.65 'Hanken Grotesk', sans-serif`, color: 'var(--ink)', textWrap: 'pretty' }} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* SPECIAL MENTION */}
      {zone.feature && (
        <div style={{ background: 'var(--sand)', padding: `${isDesktop ? 72 : 44}px ${px}px`, display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, gap: 56, alignItems: 'center' }}>
          <div>
            <Reveal className="eyebrow" style={{ letterSpacing: '.26em' }}>{zone.feature.label}</Reveal>
            <Reveal className="script" delay={150} style={{ fontSize: isDesktop ? 56 : 40, color: 'var(--bark)', lineHeight: .92, margin: '6px 0 16px' }}>
              {zone.feature.name.toLowerCase()}
            </Reveal>
            <Reveal delay={300}>
              <Paras items={zone.feature.body} gap={12} style={{ font: `300 ${isDesktop ? 15.5 : 14}px/1.7 'Hanken Grotesk', sans-serif`, color: 'var(--ink)', textWrap: 'pretty' }} />
            </Reveal>
          </div>
          <PhotoFrame img={zone.feature.img} drift={60} float={isDesktop ? 26 : 0} style={{ height: isDesktop ? 380 : 240, borderRadius: 4, marginTop: isDesktop ? 0 : 24 }}>
            <div className="phcap">{zone.feature.cap}</div>
          </PhotoFrame>
        </div>
      )}

      {/* PLAN CTA */}
      <div style={{ background: 'var(--bark)', padding: `${isDesktop ? 84 : 56}px ${px}px`, textAlign: 'center' }}>
        <Reveal className="script" style={{ fontSize: isDesktop ? 64 : 42, color: 'var(--oat)', lineHeight: .95 }}>
          plan {zone.name.toLowerCase()}
        </Reveal>
        <Reveal as="p" delay={150} style={{ margin: '16px auto 0', maxWidth: 460, font: `300 ${isDesktop ? 16 : 14.5}px/1.6 'Hanken Grotesk', sans-serif`, color: 'rgba(231,220,203,.8)', textTransform: 'lowercase' }}>
          we'll shape the stays, drives and sunrises around the sights you love.
        </Reveal>
        <Reveal delay={300} style={{ marginTop: 28 }}>
          <button
            className="pill"
            onClick={() => onPlan({ where: region.slug, message: `tell me about ${zone.name.toLowerCase()}` })}
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
