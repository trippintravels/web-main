import { useState } from 'react';
import {
  DESTINATIONS, SERVICES, PROCESS, FOOTER, NAV,
  HERO_IMG, STORY_IMG, QUOTE_IMG,
} from './data.js';

/* Explore rows for desktop — alternating photo side, widths & heights per mockup */
const DESK_ROWS = [
  { i: 0, side: 'left',  w: '60%', h: 460, fs: 60 },
  { i: 1, side: 'right', w: '54%', h: 380, fs: 56 },
  { i: 2, side: 'left',  w: '44%', h: 340, fs: 52 },
  { i: 3, side: 'right', w: '48%', h: 300, fs: 52 },
  { i: 4, side: 'left',  w: '58%', h: 340, fs: 56 },
  { i: 5, side: 'right', w: '56%', h: 320, fs: 52 },
];

function DeskRow({ dest, side, w, h, fs }) {
  const photo = (
    <div
      className="ph"
      style={{
        flex: 'none', width: w, height: h,
        borderRadius: side === 'left' ? '0 4px 4px 0' : '4px 0 0 4px',
        backgroundImage: `linear-gradient(180deg,rgba(20,16,12,.10),rgba(20,16,12,.28)),url('${dest.img}')`,
      }}
    >
      <div className="phcap">{dest.name}</div>
    </div>
  );
  const text = (
    <div style={{ flex: 1, textAlign: side === 'left' ? 'left' : 'right',
      paddingRight: side === 'left' ? 72 : 0, paddingLeft: side === 'right' ? 72 : 0 }}>
      <div className="script" style={{ fontSize: fs, color: 'var(--bark)', lineHeight: .88 }}>
        {dest.name === 'offbeat & unexplored' ? <>offbeat &amp;<br />unexplored</> : dest.name}
      </div>
      <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'rgba(41,33,28,.5)', textTransform: 'lowercase', marginTop: 12 }}>
        {dest.meta}
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 60 }}>
      {side === 'left' ? <>{photo}{text}</> : <>{text}{photo}</>}
    </div>
  );
}

const megaPanel = {
  position: 'absolute', top: 72, left: 0, right: 0, zIndex: 20,
  background: 'var(--bark-deep)', padding: '36px 72px 40px',
  boxShadow: '0 24px 50px -20px rgba(20,16,12,.6)',
  animation: 'fadeIn .22s ease',
};
const megaLabel = { font: "600 10px 'Hanken Grotesk', sans-serif", letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--clay-light)' };
const megaItem = { cursor: 'pointer' };
const megaGrid = (cols) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '16px 30px', marginTop: 20, font: "300 17px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(241,235,224,.85)' });

export default function DesktopHome({ onPlan }) {
  const [panel, setPanel] = useState(null); // 'exp' | 'tours' | 'story' | null
  const toggle = (p) => setPanel((cur) => (cur === p ? null : p));

  const navItem = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };

  return (
    <div style={{ width: '100%', position: 'relative', background: 'var(--oat)', overflow: 'hidden' }}>
      {/* HERO + NAV */}
      <div style={{ position: 'relative' }}>
        <div
          className="ph"
          style={{ height: 664, backgroundImage: `linear-gradient(180deg,rgba(20,16,12,.22),rgba(20,16,12,.55)),url('${HERO_IMG}')` }}
        >
          <div className="phcap">eastern himalaya · atmospheric morning light</div>
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', padding: '38px 72px 60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ font: "500 14px 'Hanken Grotesk', sans-serif", letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--oat)' }}>
                trippin travels
              </span>
              <div style={{ display: 'flex', gap: 38, font: "400 14px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', letterSpacing: '.03em', color: 'rgba(241,235,224,.92)' }}>
                <span style={navItem} onClick={() => toggle('exp')}>expeditions <span style={{ fontSize: 9, color: 'var(--oat)' }}>▾</span></span>
                <span style={navItem} onClick={() => toggle('tours')}>tours &amp; rentals <span style={{ fontSize: 9, color: 'var(--oat)' }}>▾</span></span>
                <span style={navItem} onClick={() => toggle('story')}>our story <span style={{ fontSize: 9, color: 'var(--oat)' }}>▾</span></span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', maxWidth: 700 }}>
              <div style={{ font: "400 12px 'Hanken Grotesk', sans-serif", letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(241,235,224,.8)' }}>
                bespoke travel · eastern himalaya
              </div>
              <div className="script" style={{ fontSize: 132, lineHeight: .8, color: 'var(--cream)', marginTop: 14 }}>
                go beyond<br />the trails
              </div>
              <button
                className="pill"
                onClick={onPlan}
                style={{ marginTop: 34, font: "500 13px 'Hanken Grotesk', sans-serif", color: 'var(--bark-deep)', background: 'var(--oat)', padding: '16px 34px' }}
              >
                plan your journey
              </button>
            </div>
          </div>
        </div>

        {/* MEGA MENU PANELS */}
        {panel === 'exp' && (
          <div style={megaPanel}>
            <div style={megaLabel}>expeditions</div>
            <div style={megaGrid(4)}>
              {NAV.expeditions.map((x) => <span key={x} style={megaItem}>{x}</span>)}
            </div>
          </div>
        )}
        {panel === 'tours' && (
          <div style={{ ...megaPanel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <div style={megaLabel}>tours</div>
              <div style={megaGrid(2)}>{NAV.tours.map((x) => <span key={x} style={megaItem}>{x}</span>)}</div>
            </div>
            <div>
              <div style={megaLabel}>rentals</div>
              <div style={megaGrid(2)}>{NAV.rentals.map((x) => <span key={x} style={megaItem}>{x}</span>)}</div>
            </div>
          </div>
        )}
        {panel === 'story' && (
          <div style={megaPanel}>
            <div style={megaLabel}>our story</div>
            <div style={megaGrid(3)}>{NAV.story.map((x) => <span key={x} style={megaItem}>{x}</span>)}</div>
          </div>
        )}
      </div>

      {/* 00 EXPLORE */}
      <div style={{ background: 'var(--oat)', padding: '72px 0 52px' }}>
        <div style={{ padding: '0 72px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52 }}>
          <div>
            <div className="eyebrow" style={{ letterSpacing: '.26em' }}>00 — get right to it</div>
            <div className="script" style={{ fontSize: 72, color: 'var(--bark)', lineHeight: .85, marginTop: 6 }}>where to wander</div>
          </div>
          <div style={{ font: "300 15px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', maxWidth: 280, textAlign: 'right', paddingBottom: 10 }}>
            seven corners of the eastern himalaya — pick one, or let us thread a few together.
          </div>
        </div>
        <div>
          {DESK_ROWS.map((r) => (
            <DeskRow key={r.i} dest={DESTINATIONS[r.i]} side={r.side} w={r.w} h={r.h} fs={r.fs} />
          ))}
        </div>
      </div>

      {/* 01 ETHOS */}
      <div style={{ background: 'var(--oat)', padding: '72px 72px 60px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
        <div className="eyebrow" style={{ letterSpacing: '.26em', paddingTop: 10 }}>01 — who we are</div>
        <p style={{ margin: 0, font: "300 30px/1.4 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty', maxWidth: 860 }}>
          an immersive experience, unexplored destinations, and travel shaped entirely around you. we craft hand-made escapes that connect you to the ethos of each place.
        </p>
      </div>

      {/* 02 STORY */}
      <div style={{ background: 'var(--sand)', padding: '72px 72px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ letterSpacing: '.26em' }}>02 — our story</div>
          <div className="script" style={{ fontSize: 64, color: 'var(--bark)', lineHeight: .9, margin: '8px 0 18px' }}>where it began</div>
          <p style={{ margin: 0, font: "300 17px/1.65 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', textWrap: 'pretty' }}>
            trippin travels started with three friends and one simple passion — exploring places most people haven't found yet. weekend getaways became a way to make every journey feel personal, not packaged. our idea of luxury is about feeling connected — the stays, the people, the food, and the stories worth coming back with.
          </p>
        </div>
        <div
          className="ph"
          style={{ height: 420, borderRadius: 16, backgroundImage: `linear-gradient(180deg,rgba(20,16,12,.22),rgba(20,16,12,.55)),url('${STORY_IMG}')` }}
        >
          <div className="phcap">three friends · beyond the usual trails</div>
        </div>
      </div>

      {/* 03 SERVICES */}
      <div style={{ background: 'var(--oat)', padding: '72px 72px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px 48px' }}>
            {SERVICES.map((s) => (
              <div key={s.n}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'var(--clay)' }}>{s.n}</span>
                  <span className="script" style={{ fontSize: 34, color: 'var(--bark)' }}>{s.title}</span>
                </div>
                <p style={{ margin: '10px 0 0 28px', font: "300 15px/1.6 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="eyebrow" style={{ letterSpacing: '.26em' }}>03 — what we do</div>
            <div className="script" style={{ fontSize: 60, color: 'var(--bark)', lineHeight: .9, marginTop: 6 }}>our services</div>
          </div>
        </div>
      </div>

      {/* 04 PROCESS */}
      <div style={{ background: 'var(--sand2)', padding: '72px 72px 68px' }}>
        <div className="eyebrow" style={{ letterSpacing: '.26em' }}>04 — how it works</div>
        <div className="script" style={{ fontSize: 60, color: 'var(--bark)', lineHeight: .9, margin: '6px 0 34px' }}>our process</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
          {PROCESS.map((p) => (
            <div key={p.step}>
              <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'var(--clay)', letterSpacing: '.1em' }}>{p.step}</div>
              <div style={{ font: "500 22px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'var(--bark)', margin: '8px 0 10px' }}>{p.title}</div>
              <p style={{ margin: 0, font: "300 15px/1.6 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BESPOKE / NO PRICING */}
      <div style={{ background: 'var(--bark)', padding: '80px 72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', color: 'var(--sand)' }}>
        <div className="script" style={{ fontSize: 76, color: 'var(--oat)', lineHeight: .92 }}>made for you, only</div>
        <p style={{ margin: 0, font: "300 18px/1.65 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.82)', textTransform: 'lowercase', textWrap: 'pretty' }}>
          no fixed packages, no set prices. every trip is customised to your pace, your people and your idea of a good day — then quoted to the journey we build together.
        </p>
      </div>

      {/* QUOTE */}
      <div
        className="ph"
        style={{ height: 420, backgroundImage: `linear-gradient(180deg,rgba(20,16,12,.22),rgba(20,16,12,.55)),url('${QUOTE_IMG}')` }}
      >
        <div className="phcap">lachen valley · first light</div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right', padding: '0 72px' }}>
          <div className="script" style={{ fontSize: 76, lineHeight: 1, color: 'var(--cream)', maxWidth: 760 }}>
            the mountains don't rush — and neither do we
          </div>
        </div>
      </div>

      {/* ENQUIRY */}
      <div style={{ background: 'var(--oat)', padding: '80px 72px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow" style={{ letterSpacing: '.26em' }}>05 — begin</div>
          <div className="script" style={{ fontSize: 72, color: 'var(--bark)', lineHeight: .92, marginTop: 8 }}>planning something?</div>
        </div>
        <button
          className="pill"
          onClick={onPlan}
          style={{ font: "500 14px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '17px 38px', whiteSpace: 'nowrap' }}
        >
          start your enquiry
        </button>
      </div>

      {/* FOOTER */}
      <div style={{ background: 'var(--bark-deep)', padding: '60px 72px 56px', color: 'var(--sand)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <div className="script" style={{ fontSize: 52, color: 'var(--oat)' }}>trippin travels</div>
          <div style={{ marginTop: 20, font: "300 13px/1.6 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.6)', maxWidth: 260 }}>
            bespoke journeys through the eastern himalaya. made for you, only.
          </div>
          <a href="#" style={{ marginTop: 22, display: 'inline-flex', width: 30, height: 30, color: 'var(--sand)' }} aria-label="instagram">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
        <FooterCol title="expeditions" items={FOOTER.expeditions} />
        <FooterCol title="tours & rentals" items={FOOTER.toursRentals} />
        <FooterCol title="our story" items={FOOTER.story} />
      </div>
    </div>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div style={{ font: "600 10px 'Hanken Grotesk', sans-serif", letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--clay-light)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14, font: "300 13px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(231,220,203,.72)' }}>
        {items.map((x) => <span key={x}>{x}</span>)}
      </div>
    </div>
  );
}
