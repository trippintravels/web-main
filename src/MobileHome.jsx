import PhotoFrame from './PhotoFrame.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import ExploreLink from './ExploreLink.jsx';
import MobileTopBar from './MobileTopBar.jsx';
import {
  DESTINATIONS, SERVICES, PROCESS, destinationHref,
  HERO_IMG, STORY_IMG, QUOTE_IMG,
} from './data.js';

const LIGHT_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.10),rgba(20,16,12,.28))';

/* alternating edge-bleed rows for the "where to wander" magazine grid.
   `side` = which edge the photo bleeds to. heights mirror the mockup. */
const MOBILE_ROWS = [
  { i: 0, side: 'right', h: 300, tw: '35%' },
  { i: 1, side: 'left',  h: 236, tw: '33%' },
  { i: 2, side: 'right', h: 270, tw: '38%' },
  { i: 3, side: 'left',  h: 244, tw: '42%' },
];

function BleedRow({ dest, side, h, tw }) {
  const photo = (
    <PhotoFrame
      img={dest.img}
      overlay={LIGHT_OVERLAY}
      drift={50}
      float={22}
      style={{
        flex: 1, height: h,
        borderRadius: side === 'right' ? '3px 0 0 3px' : '0 3px 3px 0',
      }}
    >
      <div className="phcap">{dest.name}</div>
    </PhotoFrame>
  );
  const text = (
    <Reveal style={{ flex: 'none', width: tw, textAlign: side === 'right' ? 'left' : 'right',
      paddingLeft: side === 'right' ? 26 : 0, paddingRight: side === 'left' ? 26 : 0 }}>
      <div className="script" style={{ fontSize: 32, color: 'var(--bark)', lineHeight: .95 }}>{dest.name}</div>
      <div className="mono" style={{ font: '400 10px ui-monospace, Menlo, monospace', color: 'rgba(41,33,28,.5)', textTransform: 'lowercase', marginTop: 6 }}>
        {dest.meta}
      </div>
      <ExploreLink href={destinationHref(dest.slug)} style={{ marginTop: 12, fontSize: 11, gap: 6, letterSpacing: '.06em' }} />
    </Reveal>
  );
  return (
    <div style={{ display: 'flex', alignItems: side === 'right' ? 'flex-end' : 'flex-start', gap: 14, marginTop: 24 }}>
      {side === 'right' ? <>{text}{photo}</> : <>{photo}{text}</>}
    </div>
  );
}

export default function MobileHome({ onMenu, onPlan, onStory, onHome, onRegion }) {
  return (
    <div style={{ background: 'var(--oat)' }}>
      {/* HERO */}
      <PhotoFrame img={HERO_IMG} drift={80} float={0} style={{ height: 600 }}>
        <div className="phcap">eastern himalaya · morning mist</div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', padding: '46px 26px 34px' }}>
          <MobileTopBar onMenu={onMenu} />
          <div style={{ marginTop: 'auto', textAlign: 'left' }}>
            <Reveal className="script" style={{ fontSize: 90, lineHeight: .82, color: 'var(--cream)' }}>go<br />beyond</Reveal>
            <Reveal delay={150} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="script" style={{ fontSize: 90, lineHeight: .82, color: 'var(--cream)', whiteSpace: 'nowrap', flexShrink: 0 }}>the trails</span>
              <button
                className="hero-cta"
                onClick={onPlan}
                aria-label="plan your journey"
                style={{ width: 58, height: 58, flex: 'none' }}
              >
                <svg className="hero-cta-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </button>
            </Reveal>
          </div>
        </div>
      </PhotoFrame>

      {/* 00 EXPLORE */}
      <div style={{ background: 'var(--oat)', padding: '44px 0 22px' }}>
        <Reveal style={{ padding: '0 26px' }}>
          <div className="eyebrow">00 – get right to it</div>
          <div className="script" style={{ fontSize: 44, color: 'var(--bark)', lineHeight: .9, marginTop: 6 }}>where to wander</div>
        </Reveal>
        <div style={{ marginTop: 6 }}>
          {MOBILE_ROWS.map((r) => (
            <BleedRow key={r.i} dest={DESTINATIONS[r.i]} side={r.side} h={r.h} tw={r.tw} />
          ))}
        </div>
      </div>

      {/* 01 ETHOS */}
      <div style={{ background: 'var(--oat)', padding: '44px 26px 40px', textAlign: 'left' }}>
        <Reveal className="eyebrow">01 – who we are</Reveal>
        <Reveal as="p" delay={150} style={{ margin: '16px 0 0', font: "300 21px/1.45 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty' }}>
          an immersive experience, unexplored destinations, and travel shaped entirely around you. we craft hand-made escapes that connect you to the ethos of each place.
        </Reveal>
      </div>

      {/* 02 STORY */}
      <PhotoFrame img={STORY_IMG} drift={56} float={0} style={{ height: 300 }}>
        <div className="phcap">three friends · beyond the usual trails</div>
      </PhotoFrame>
      <div style={{ background: 'var(--sand)', padding: '44px 26px 42px', textAlign: 'left' }}>
        <Reveal className="eyebrow">02 – our story</Reveal>
        <Reveal className="script" delay={150} style={{ fontSize: 42, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 16px' }}>where it began</Reveal>
        <Reveal as="p" delay={300} style={{ margin: 0, font: "300 16px/1.6 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty' }}>
          trippin' travels started with three friends and one simple passion – exploring places most people haven't found yet. weekend getaways became a way to make every journey feel personal, not packaged. our idea of luxury is about feeling connected – the stays, the people, the food, and the stories worth coming back with.
        </Reveal>
      </div>

      {/* 03 SERVICES */}
      <div style={{ background: 'var(--oat)', padding: '44px 26px 40px', textAlign: 'right' }}>
        <Reveal className="eyebrow">03 – what we do</Reveal>
        <Reveal className="script" delay={150} style={{ fontSize: 42, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 22px' }}>our services</Reveal>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SERVICES.map((s, i) => (
            <Reveal key={s.n} style={{ padding: '20px 0', borderTop: '1px solid rgba(41,33,28,.16)', borderBottom: i === SERVICES.length - 1 ? '1px solid rgba(41,33,28,.16)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, justifyContent: 'flex-end' }}>
                <span className="script" style={{ fontSize: 28, color: 'var(--bark)' }}>{s.title}</span>
                <span className="mono" style={{ font: '400 11px ui-monospace, Menlo, monospace', color: 'var(--clay)' }}>{s.n}</span>
              </div>
              <p style={{ margin: '8px 0 0', font: "300 13.5px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 04 PROCESS */}
      <div style={{ background: 'var(--sand2)', padding: '44px 26px 42px', textAlign: 'left' }}>
        <Reveal className="eyebrow">04 – how it works</Reveal>
        <Reveal className="script" delay={150} style={{ fontSize: 42, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 22px' }}>our process</Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {PROCESS.map((p) => (
            <Reveal key={p.step}>
              <div className="mono" style={{ font: '400 11px ui-monospace, Menlo, monospace', color: 'var(--clay)', letterSpacing: '.1em' }}>{p.step}</div>
              <div style={{ font: "500 17px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'var(--bark)', marginTop: 4 }}>{p.title}</div>
              <p style={{ margin: '6px 0 0', font: "300 13.5px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* BESPOKE / NO PRICING */}
      <div style={{ background: 'var(--bark)', padding: '46px 26px', textAlign: 'left', color: 'var(--sand)' }}>
        <Reveal className="script" style={{ fontSize: 40, color: 'var(--oat)', lineHeight: .95 }}>made for you, only</Reveal>
        <Reveal as="p" delay={150} style={{ margin: '14px 0 0', font: "300 15px/1.6 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.82)', textTransform: 'lowercase' }}>
          no fixed packages, no set prices. every trip is customised to your pace, your people and your idea of a good day – then quoted to the journey we build together.
        </Reveal>
      </div>

      {/* QUOTE */}
      <PhotoFrame img={QUOTE_IMG} drift={56} float={0} style={{ height: 290 }}>
        <div className="phcap">lachen valley · first light</div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right', padding: '34px 30px' }}>
          <Reveal className="script" style={{ fontSize: 38, lineHeight: 1.05, color: 'var(--cream)' }}>
            the mountains<br />don't rush –<br />and neither do we
          </Reveal>
        </div>
      </PhotoFrame>

      {/* ENQUIRY */}
      <div style={{ background: 'var(--oat)', padding: '48px 26px 46px', textAlign: 'left' }}>
        <Reveal className="eyebrow">05 – begin</Reveal>
        <Reveal className="script" delay={150} style={{ fontSize: 44, color: 'var(--bark)', lineHeight: .92, margin: '8px 0 18px' }}>planning something?</Reveal>
        <Reveal delay={300}>
          <button
            className="pill"
            onClick={onPlan}
            style={{ font: "500 13px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '15px 30px' }}
          >
            start your enquiry
          </button>
        </Reveal>
      </div>

      <SiteFooter isDesktop={false} onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
