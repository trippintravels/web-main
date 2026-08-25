import PhotoFrame from './PhotoFrame.jsx';
import SiteFooter from './SiteFooter.jsx';
import {
  DESTINATIONS, SERVICES, PROCESS,
  HERO_IMG, STORY_IMG, QUOTE_IMG,
} from './data.js';

const LIGHT_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.10),rgba(20,16,12,.28))';

/* alternating edge-bleed rows for the "where to wander" magazine grid.
   `side` = which edge the photo bleeds to. heights mirror the mockup. */
const MOBILE_ROWS = [
  { i: 0, side: 'right', h: 300, tw: '35%' },
  { i: 1, side: 'left',  h: 236, tw: '33%' },
  { i: 2, side: 'right', h: 270, tw: '38%' },
  { i: 3, side: 'left',  h: 182, tw: '40%' },
  { i: 4, side: 'right', h: 212, tw: '33%' },
  { i: 5, side: 'left',  h: 244, tw: '37%' },
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
    <div style={{ flex: 'none', width: tw, textAlign: side === 'right' ? 'left' : 'right',
      paddingLeft: side === 'right' ? 26 : 0, paddingRight: side === 'left' ? 26 : 0 }}>
      <div className="script" style={{ fontSize: 32, color: 'var(--bark)', lineHeight: .95 }}>{dest.name}</div>
      <div className="mono" style={{ font: '400 10px ui-monospace, Menlo, monospace', color: 'rgba(41,33,28,.5)', textTransform: 'lowercase', marginTop: 6 }}>
        {dest.meta}
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: side === 'right' ? 'flex-end' : 'flex-start', gap: 14, marginTop: 24 }}>
      {side === 'right' ? <>{text}{photo}</> : <>{photo}{text}</>}
    </div>
  );
}

export default function MobileHome({ onMenu, onPlan, onStory, onHome }) {
  return (
    <div style={{ background: 'var(--oat)' }}>
      {/* HERO */}
      <PhotoFrame img={HERO_IMG} drift={80} float={0} style={{ height: 600 }}>
        <div className="phcap">eastern himalaya · morning mist</div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', padding: '46px 26px 34px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
            <span className="wordmark" style={{ fontSize: 17, color: 'var(--oat)' }}>
              trippin' travels
            </span>
            <button
              onClick={onMenu}
              aria-label="Open menu"
              style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', background: 'none', border: 0, padding: 4 }}
            >
              <span style={{ width: 22, height: 1.5, background: 'var(--oat)' }} />
              <span style={{ width: 22, height: 1.5, background: 'var(--oat)' }} />
            </button>
          </div>
          <div style={{ marginTop: 'auto', textAlign: 'left' }}>
            <div className="script" style={{ fontSize: 90, lineHeight: .82, color: 'var(--cream)' }}>go<br />beyond</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            </div>
          </div>
        </div>
      </PhotoFrame>

      {/* 00 EXPLORE */}
      <div style={{ background: 'var(--oat)', padding: '44px 0 22px' }}>
        <div style={{ padding: '0 26px' }}>
          <div className="eyebrow">00 — get right to it</div>
          <div className="script" style={{ fontSize: 44, color: 'var(--bark)', lineHeight: .9, marginTop: 6 }}>where to wander</div>
        </div>
        <div style={{ marginTop: 6 }}>
          {MOBILE_ROWS.map((r) => (
            <BleedRow key={r.i} dest={DESTINATIONS[r.i]} side={r.side} h={r.h} tw={r.tw} />
          ))}
        </div>
      </div>

      {/* 01 ETHOS */}
      <div style={{ background: 'var(--oat)', padding: '44px 26px 40px', textAlign: 'left' }}>
        <div className="eyebrow">01 — who we are</div>
        <p style={{ margin: '16px 0 0', font: "300 21px/1.45 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty' }}>
          an immersive experience, unexplored destinations, and travel shaped entirely around you. we craft hand-made escapes that connect you to the ethos of each place.
        </p>
      </div>

      {/* 02 STORY */}
      <PhotoFrame img={STORY_IMG} drift={56} float={0} style={{ height: 300 }}>
        <div className="phcap">three friends · beyond the usual trails</div>
      </PhotoFrame>
      <div style={{ background: 'var(--sand)', padding: '44px 26px 42px', textAlign: 'left' }}>
        <div className="eyebrow">02 — our story</div>
        <div className="script" style={{ fontSize: 42, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 16px' }}>where it began</div>
        <p style={{ margin: 0, font: "300 16px/1.6 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty' }}>
          trippin' travels started with three friends and one simple passion — exploring places most people haven't found yet. weekend getaways became a way to make every journey feel personal, not packaged. our idea of luxury is about feeling connected — the stays, the people, the food, and the stories worth coming back with.
        </p>
      </div>

      {/* 03 SERVICES */}
      <div style={{ background: 'var(--oat)', padding: '44px 26px 40px', textAlign: 'right' }}>
        <div className="eyebrow">03 — what we do</div>
        <div className="script" style={{ fontSize: 42, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 22px' }}>our services</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SERVICES.map((s, i) => (
            <div key={s.n} style={{ padding: '20px 0', borderTop: '1px solid rgba(41,33,28,.16)', borderBottom: i === SERVICES.length - 1 ? '1px solid rgba(41,33,28,.16)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, justifyContent: 'flex-end' }}>
                <span className="script" style={{ fontSize: 28, color: 'var(--bark)' }}>{s.title}</span>
                <span className="mono" style={{ font: '400 11px ui-monospace, Menlo, monospace', color: 'var(--clay)' }}>{s.n}</span>
              </div>
              <p style={{ margin: '8px 0 0', font: "300 13.5px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 04 PROCESS */}
      <div style={{ background: 'var(--sand2)', padding: '44px 26px 42px', textAlign: 'left' }}>
        <div className="eyebrow">04 — how it works</div>
        <div className="script" style={{ fontSize: 42, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 22px' }}>our process</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {PROCESS.map((p) => (
            <div key={p.step}>
              <div className="mono" style={{ font: '400 11px ui-monospace, Menlo, monospace', color: 'var(--clay)', letterSpacing: '.1em' }}>{p.step}</div>
              <div style={{ font: "500 17px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'var(--bark)', marginTop: 4 }}>{p.title}</div>
              <p style={{ margin: '6px 0 0', font: "300 13.5px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BESPOKE / NO PRICING */}
      <div style={{ background: 'var(--bark)', padding: '46px 26px', textAlign: 'left', color: 'var(--sand)' }}>
        <div className="script" style={{ fontSize: 40, color: 'var(--oat)', lineHeight: .95 }}>made for you, only</div>
        <p style={{ margin: '14px 0 0', font: "300 15px/1.6 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.82)', textTransform: 'lowercase' }}>
          no fixed packages, no set prices. every trip is customised to your pace, your people and your idea of a good day — then quoted to the journey we build together.
        </p>
      </div>

      {/* QUOTE */}
      <PhotoFrame img={QUOTE_IMG} drift={56} float={0} style={{ height: 290 }}>
        <div className="phcap">lachen valley · first light</div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right', padding: '34px 30px' }}>
          <div className="script" style={{ fontSize: 38, lineHeight: 1.05, color: 'var(--cream)' }}>
            the mountains<br />don't rush —<br />and neither do we
          </div>
        </div>
      </PhotoFrame>

      {/* ENQUIRY */}
      <div style={{ background: 'var(--oat)', padding: '48px 26px 46px', textAlign: 'left' }}>
        <div className="eyebrow">05 — begin</div>
        <div className="script" style={{ fontSize: 44, color: 'var(--bark)', lineHeight: .92, margin: '8px 0 18px' }}>planning something?</div>
        <button
          className="pill"
          onClick={onPlan}
          style={{ font: "500 13px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '15px 30px' }}
        >
          start your enquiry
        </button>
      </div>

      <SiteFooter isDesktop={false} onStory={onStory} onHome={onHome} />
    </div>
  );
}
