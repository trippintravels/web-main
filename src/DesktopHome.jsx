import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import ExploreLink from './ExploreLink.jsx';
import {
  DESTINATIONS, SERVICES, PROCESS, destinationHref,
  HERO_IMG, STORY_IMG, QUOTE_IMG,
} from './data.js';

const LIGHT_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.10),rgba(20,16,12,.28))';

/* Explore rows for desktop — alternating photo side, widths & heights per mockup.
   One row per region; the last row swells slightly so the page ends on the
   most evocative of the four rather than trailing off. */
const DESK_ROWS = [
  { i: 0, side: 'left',  w: '60%', h: 460, fs: 60 },
  { i: 1, side: 'right', w: '54%', h: 400, fs: 56 },
  { i: 2, side: 'left',  w: '46%', h: 340, fs: 52 },
  { i: 3, side: 'right', w: '56%', h: 380, fs: 56 },
];

function DeskRow({ dest, side, w, h, fs }) {
  const photo = (
    <PhotoFrame
      img={dest.img}
      overlay={LIGHT_OVERLAY}
      drift={60}
      float={26}
      style={{
        flex: 'none', width: w, height: h,
        borderRadius: side === 'left' ? '0 4px 4px 0' : '4px 0 0 4px',
      }}
    >
      <div className="phcap">{dest.name}</div>
    </PhotoFrame>
  );
  const text = (
    <Reveal style={{ flex: 1, textAlign: side === 'left' ? 'left' : 'right',
      paddingRight: side === 'left' ? 72 : 0, paddingLeft: side === 'right' ? 72 : 0 }}>
      <div className="script" style={{ fontSize: fs, color: 'var(--bark)', lineHeight: .88 }}>
        {dest.name === 'offbeat & unexplored' ? <>offbeat &amp;<br />unexplored</> : dest.name}
      </div>
      <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'rgba(41,33,28,.5)', textTransform: 'lowercase', marginTop: 12 }}>
        {dest.meta}
      </div>
      <ExploreLink href={destinationHref(dest.slug)} style={{ marginTop: 20 }} />
    </Reveal>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 60 }}>
      {side === 'left' ? <>{photo}{text}</> : <>{text}{photo}</>}
    </div>
  );
}

export default function DesktopHome({ onPlan, onStory, onHome, onRegion }) {
  return (
    <div style={{ width: '100%', position: 'relative', background: 'var(--oat)', overflow: 'hidden' }}>
      {/* HERO + NAV */}
      <div style={{ position: 'relative' }}>
        <PhotoFrame img={HERO_IMG} drift={80} float={0} style={{ height: 664 }}>
          <div className="phcap">eastern himalaya · atmospheric morning light</div>
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '38px 72px 60px' }}>
            <div style={{ maxWidth: 700 }}>
              <Reveal className="script" style={{ fontSize: 132, lineHeight: .8, color: 'var(--cream)' }}>go beyond</Reveal>
              <Reveal delay={150} style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                <span className="script" style={{ fontSize: 132, lineHeight: .8, color: 'var(--cream)', whiteSpace: 'nowrap', flexShrink: 0 }}>the trails</span>
                <button
                  className="hero-cta"
                  onClick={onPlan}
                  aria-label="plan your journey"
                  style={{ width: 68, height: 68, flex: 'none' }}
                >
                  <svg className="hero-cta-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </button>
              </Reveal>
            </div>
          </div>
        </PhotoFrame>

        {/* shared top nav + frosted mega-menu */}
        <DesktopNav onStory={onStory} onRegion={onRegion} />
      </div>

      {/* 00 EXPLORE */}
      <div style={{ background: 'var(--oat)', padding: '72px 0 52px' }}>
        <div style={{ padding: '0 72px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52 }}>
          <Reveal>
            <div className="eyebrow" style={{ letterSpacing: '.26em' }}>00 — get right to it</div>
            <div className="script" style={{ fontSize: 72, color: 'var(--bark)', lineHeight: .85, marginTop: 6 }}>where to wander</div>
          </Reveal>
          <Reveal delay={150} style={{ font: "300 15px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', maxWidth: 280, textAlign: 'right', paddingBottom: 10 }}>
            four corners of the eastern himalaya — pick one, or let us thread a few together.
          </Reveal>
        </div>
        <div>
          {DESK_ROWS.map((r) => (
            <DeskRow key={r.i} dest={DESTINATIONS[r.i]} side={r.side} w={r.w} h={r.h} fs={r.fs} />
          ))}
        </div>
      </div>

      {/* 01 ETHOS */}
      <div style={{ background: 'var(--oat)', padding: '72px 72px 60px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
        <Reveal className="eyebrow" style={{ letterSpacing: '.26em', paddingTop: 10 }}>01 — who we are</Reveal>
        <Reveal as="p" delay={150} style={{ margin: 0, font: "300 30px/1.4 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty', maxWidth: 860 }}>
          an immersive experience, unexplored destinations, and travel shaped entirely around you. we craft hand-made escapes that connect you to the ethos of each place.
        </Reveal>
      </div>

      {/* 02 STORY */}
      <div style={{ background: 'var(--sand)', padding: '72px 72px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <Reveal>
          <div className="eyebrow" style={{ letterSpacing: '.26em' }}>02 — our story</div>
          <div className="script" style={{ fontSize: 64, color: 'var(--bark)', lineHeight: .9, margin: '8px 0 18px' }}>where it began</div>
          <p style={{ margin: 0, font: "300 17px/1.65 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty' }}>
            trippin' travels started with three friends and one simple passion — exploring places most people haven't found yet. weekend getaways became a way to make every journey feel personal, not packaged. our idea of luxury is about feeling connected — the stays, the people, the food, and the stories worth coming back with.
          </p>
        </Reveal>
        <PhotoFrame img={STORY_IMG} drift={60} float={26} style={{ height: 420, borderRadius: 16 }}>
          <div className="phcap">three friends · beyond the usual trails</div>
        </PhotoFrame>
      </div>

      {/* 03 SERVICES */}
      <div style={{ background: 'var(--oat)', padding: '72px 72px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px 48px' }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'var(--clay)' }}>{s.n}</span>
                  <span className="script" style={{ fontSize: 34, color: 'var(--bark)' }}>{s.title}</span>
                </div>
                <p style={{ margin: '10px 0 0 28px', font: "300 15px/1.6 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{s.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal style={{ textAlign: 'right' }}>
            <div className="eyebrow" style={{ letterSpacing: '.26em' }}>03 — what we do</div>
            <div className="script" style={{ fontSize: 60, color: 'var(--bark)', lineHeight: .9, marginTop: 6 }}>our services</div>
          </Reveal>
        </div>
      </div>

      {/* 04 PROCESS */}
      <div style={{ background: 'var(--sand2)', padding: '72px 72px 68px' }}>
        <Reveal className="eyebrow" style={{ letterSpacing: '.26em' }}>04 — how it works</Reveal>
        <Reveal className="script" delay={150} style={{ fontSize: 60, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 34px' }}>our process</Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
          {PROCESS.map((p, i) => (
            <Reveal key={p.step} delay={i * 120}>
              <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'var(--clay)', letterSpacing: '.1em' }}>{p.step}</div>
              <div style={{ font: "500 22px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'var(--bark)', margin: '8px 0 10px' }}>{p.title}</div>
              <p style={{ margin: 0, font: "300 15px/1.6 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* BESPOKE / NO PRICING */}
      <div style={{ background: 'var(--bark)', padding: '80px 72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', color: 'var(--sand)' }}>
        <Reveal className="script" style={{ fontSize: 76, color: 'var(--oat)', lineHeight: .92 }}>made for you, only</Reveal>
        <Reveal as="p" delay={150} style={{ margin: 0, font: "300 18px/1.65 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.82)', textTransform: 'lowercase', textWrap: 'pretty' }}>
          no fixed packages, no set prices. every trip is customised to your pace, your people and your idea of a good day — then quoted to the journey we build together.
        </Reveal>
      </div>

      {/* QUOTE */}
      <PhotoFrame img={QUOTE_IMG} drift={60} float={0} style={{ height: 420 }}>
        <div className="phcap">lachen valley · first light</div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right', padding: '0 72px' }}>
          <Reveal className="script" style={{ fontSize: 76, lineHeight: 1, color: 'var(--cream)', maxWidth: 760 }}>
            the mountains don't rush — and neither do we
          </Reveal>
        </div>
      </PhotoFrame>

      {/* ENQUIRY */}
      <div style={{ background: 'var(--oat)', padding: '80px 72px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Reveal>
          <div className="eyebrow" style={{ letterSpacing: '.26em' }}>05 — begin</div>
          <div className="script" style={{ fontSize: 72, color: 'var(--bark)', lineHeight: .92, marginTop: 8 }}>planning something?</div>
        </Reveal>
        <Reveal delay={150} style={{ display: 'flex' }}>
          <button
            className="pill"
            onClick={onPlan}
            style={{ font: "500 14px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '17px 38px', whiteSpace: 'nowrap' }}
          >
            start your enquiry
          </button>
        </Reveal>
      </div>

      <SiteFooter isDesktop onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
