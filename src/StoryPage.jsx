import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import Watermark from './Watermark.jsx';
import EnquiryForm from './EnquiryForm.jsx';
import { STORY, TEAM, INSTAGRAM_URL } from './data.js';
import Brandmark from './Brandmark.jsx';

const LIGHT_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.10),rgba(20,16,12,.28))';

/* Collage geometry for "our process" — deliberately hand-set per step rather
   than derived, so no two rows share a size, an offset or a bleed direction.
   `col` values are 12-column grid tracks; `float` is scroll speed. */
/* Collage geometry for "our process".
   
   The section is one 12-column grid, not three per-step grids. Between each
   pair of steps sits a *bridge* photograph: its top corner catches the previous
   step's frame, its lower edge runs under the next one, so the eye is handed
   from step to step instead of stepping over a gap. The flow reverses each
   time — left→right from step 1 to 2, right→left from 2 to 3.

   Overlap is produced by negative `mt` on a grid item, which both lifts it and
   shortens its row, so everything below follows. That keeps the whole thing in
   normal flow: if the copy grows, rows grow and the overlaps hold. Tuned by
   measuring the rendered corners — see the verification in the commit. */
/* Collage geometry for "our process" — one 12-column grid, not three per-step
   grids.

   Shape: each step is a frame bleeding off one edge with its copy opposite,
   and after every step a *bridge* photograph straddles the centre, overlapping
   the frame above it and the frame below. That hands the eye down the page
   instead of stepping over gaps. Sides alternate, so the bridges zig-zag.

   Two rules hold the composition together:
   • The gap between a step's frame and its copy is 134px for every step —
     photo cols 1/8 vs text 9/13 on the left-frame steps, and cols 6/13 vs
     1/5 mirrored. Change one and you must change its pair.
   • Bridges deviate from dead centre (720, 775, 610) and vary in width, so the
     column reads as a magazine spread rather than a stack.

   Overlap comes from negative `mt` on grid items, which lifts an item and
   shortens its row, so everything below follows. It all stays in normal flow:
   if the copy grows, rows grow and the overlaps hold. */
const PROCESS_ITEMS = [
  // step 1 — frame left, copy right
  { kind: 'big',    step: 0, col: '1 / 8',  row: 1, h: 470, mt: 0,   bleed: 'left',  z: 1, float: 14 },
  { kind: 'text',   step: 0, col: '9 / 13', row: 1, mt: 60,  align: 'left'  },
  { kind: 'bridge', step: 0, col: '4 / 10', row: 2, h: 250, mt: -140, z: 3, float: 30 },
  // step 2 — frame right, copy left
  { kind: 'big',    step: 1, col: '6 / 13', row: 3, h: 470, mt: -90, bleed: 'right', z: 2, float: 34 },
  { kind: 'text',   step: 1, col: '1 / 5',  row: 3, mt: 60,  align: 'right' },
  { kind: 'bridge', step: 1, col: '5 / 10', row: 4, h: 270, mt: -80,  z: 3, float: 22 },
  // step 3 — frame left, copy right
  { kind: 'big',    step: 2, col: '1 / 8',  row: 5, h: 470, mt: -90, bleed: 'left',  z: 2, float: 20 },
  { kind: 'text',   step: 2, col: '9 / 13', row: 5, mt: 60,  align: 'left'  },
  // closing bridge — nothing below it to catch, it just lets the run trail off
  { kind: 'bridge', step: 2, col: '3 / 9',  row: 6, h: 240, mt: -80,  z: 3, float: 36 },
];

/* ---------- small building blocks ---------- */

function Eyebrow({ children, dark, style }) {
  return (
    <div
      className="eyebrow"
      style={{ letterSpacing: '.26em', color: dark ? 'var(--clay-light)' : 'rgba(41,33,28,.5)', ...style }}
    >
      {children}
    </div>
  );
}

function Head({ num, title, dark, fs, align }) {
  return (
    <Reveal style={{ textAlign: align }}>
      <Eyebrow dark={dark}>{num} – {title}</Eyebrow>
      <div className="script" style={{ fontSize: fs, color: dark ? 'var(--oat)' : 'var(--bark)', lineHeight: .9, marginTop: 6 }}>
        {title}
      </div>
    </Reveal>
  );
}

/* ---------- page ---------- */

export default function StoryPage({ isDesktop, onHome, onMenu, onStory, onRegion }) {
  const px = isDesktop ? 72 : 26;
  const scrollMt = isDesktop ? 28 : 20; // small breathing room; nothing sticky to clear

  const section = (slug, extra) => ({ id: slug, style: { scrollMarginTop: scrollMt, ...extra } });

  return (
    <div style={{ background: 'var(--oat)', position: 'relative', overflow: 'hidden' }}>
      {/* HERO
          Deliberately does not announce itself as "our story" — the page opens
          with what the company is, not a page title. The logo sits behind it as
          texture, swelling as you scroll (see Watermark). */}
      {/* The "about us" anchor lives here, not on the copy below: the nav, the
          mobile menu and the footer all link to it, and clicking it should open
          the story page rather than skip past its own opening. */}
      <div id="about-us" style={{ position: 'relative', scrollMarginTop: 0 }}>
        <PhotoFrame
          img={STORY.heroImg}
          overlay="linear-gradient(180deg,rgba(20,16,12,.52),rgba(20,16,12,.62))"
          drift={isDesktop ? 80 : 36}
          float={0}
          focus="center 30%"
          style={{ height: isDesktop ? 640 : 580 }}
        >
          <Watermark tint="var(--cream)" opacity={0.07} size={isDesktop ? '72%' : '128%'} to={1.3} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: `0 ${isDesktop ? 96 : 26}px`,
          }}>
            <Reveal className="eyebrow" style={{ letterSpacing: '.4em', color: 'rgba(246,241,231,.72)' }}>
              trippin&apos; travels
            </Reveal>
            <Reveal as="p" delay={200} style={{
              margin: '22px 0 0', maxWidth: 780,
              font: `300 ${isDesktop ? 27 : 19}px/1.55 'Hanken Grotesk', sans-serif`,
              color: 'var(--cream)', textWrap: 'pretty',
            }}>
              {STORY.intro}
            </Reveal>
          </div>
        </PhotoFrame>

        {isDesktop ? (
          <DesktopNav onStory={onStory} onWordmark={onHome} onRegion={onRegion} active="story" />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: `46px ${px}px 20px` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
              <Brandmark onClick={onHome} />
              <button onClick={onMenu} aria-label="Open menu" style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', background: 'none', border: 0, padding: 4 }}>
                <span style={{ width: 22, height: 1.5, background: 'var(--oat)' }} />
                <span style={{ width: 22, height: 1.5, background: 'var(--oat)' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STAGGERED PHOTO ROW
          Three frames at different scroll speeds (`float`) and different resting
          offsets. The mismatch is the effect — matched speeds would read as one
          block sliding. Mobile keeps the composition but halves the offsets so
          the row stays inside the fold. */}
      <div style={{
        // Pulled up so the frames bite into the bottom of the hero photograph
        // rather than starting cleanly beneath it. No background of its own —
        // the page root supplies the oat, so the overlap stays transparent.
        // Each frame's own `top` offset means they cut in by different amounts.
        position: 'relative',
        zIndex: 4,
        marginTop: isDesktop ? -172 : -78,
        padding: `0 ${px}px ${isDesktop ? 54 : 58}px`,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isDesktop ? 26 : 10,
        alignItems: 'start',
      }}>
        {STORY.heroRow.map((r, i) => (
          <PhotoFrame
            key={i}
            img={r.img}
            overlay={LIGHT_OVERLAY}
            drift={44}
            float={isDesktop ? r.float : Math.round(r.float * 0.45)}
            style={{
              height: isDesktop ? r.h : Math.round(r.h * 0.46),
              marginTop: isDesktop ? r.top : Math.round(r.top * 0.5),
              borderRadius: 4,
            }}
          >
            <div className="phcap">{r.cap}</div>
          </PhotoFrame>
        ))}
      </div>

      {/* ABOUT US copy
          No heading and no photograph: the row of frames above is the visual,
          and this is the caption to it. The #about-us anchor sits on the hero,
          so the nav link opens the page rather than landing here. */}
      <div style={{
        background: 'var(--oat)',
        padding: `0 ${px}px ${isDesktop ? 52 : 56}px`,
      }}>
        <Reveal as="p" style={{
          margin: '0 auto',
          maxWidth: isDesktop ? 860 : undefined,
          textAlign: 'center',
          font: `300 ${isDesktop ? 18 : 15.5}px/1.75 'Hanken Grotesk', sans-serif`,
          color: 'var(--ink)',
          textWrap: 'pretty',
        }}>
          {STORY.aboutUs}
        </Reveal>
      </div>

      {/* 02 GALLERY */}
      <div {...section('gallery', { background: 'var(--sand)', padding: `${isDesktop ? 72 : 44}px ${px}px` })}>
        <Head num="02" title="gallery" fs={isDesktop ? 64 : 44} align="right" />
        <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: `repeat(${isDesktop ? 4 : 2}, 1fr)`, gridAutoRows: isDesktop ? 150 : 116, gap: 14 }}>
          {STORY.gallery.map((g, i) => (
            <PhotoFrame
              key={i}
              img={g.img}
              overlay={LIGHT_OVERLAY}
              drift={34}
              float={0}
              style={{ gridColumn: `span ${Math.min(g.cs, isDesktop ? 4 : 2)}`, gridRow: `span ${g.rs}`, height: '100%', borderRadius: 4 }}
            />
          ))}
        </div>
      </div>

      {/* 03 OUR SERVICES
          A full-bleed checkerboard: every row is one photograph and one solid
          block of copy, and both the side and the block colour alternate down
          the page. Bleeding to the page edges is what gives it weight — inset
          in the usual 72px gutter it reads as cards, not as a grid.

          Colour alternates sand → bark rather than sitting on clay: clay is the
          site's single accent and turning it into a page-dominant surface would
          undo that (see DESIGN.md).

          Mobile drops to one column — photo above, copy below — and the image
          drifts on scroll there, while the desktop photographs stay still. */}
      <div {...section('our-services', { background: 'var(--oat)', paddingTop: isDesktop ? 84 : 52 })}>
        <div style={{ padding: `0 ${px}px`, display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Head num="03" title="our services" fs={isDesktop ? 60 : 42} />
          <Reveal delay={150} style={{ font: "300 15px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', maxWidth: 300, textAlign: isDesktop ? 'right' : 'left', marginTop: isDesktop ? 0 : 14, paddingBottom: isDesktop ? 10 : 0 }}>
            {STORY.servicesTagline}
          </Reveal>
        </div>

        <div style={{
          marginTop: isDesktop ? 52 : 30,
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
        }}>
          {STORY.services.map((sv, i) => {
            const dark = i % 2 === 1;              // alternate sand / bark
            const textRight = i % 2 === 0;         // alternate which side the copy sits
            const photo = (
              <PhotoFrame
                key={`p${sv.n}`}
                img={sv.img}
                overlay={LIGHT_OVERLAY}
                drift={isDesktop ? 0 : 46}
                float={0}
                style={{ height: isDesktop ? '100%' : 260, minHeight: isDesktop ? 520 : undefined }}
              >
                <div className="phcap">{sv.n} · {sv.title}</div>
              </PhotoFrame>
            );
            const copy = (
              <div
                key={`c${sv.n}`}
                style={{
                  background: dark ? 'var(--bark)' : 'var(--sand)',
                  padding: isDesktop ? '68px 62px' : `40px ${px}px 46px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  // copy leans toward its photograph, so every row reads inward
                  // to the centre seam rather than out to the page edges.
                  // Mobile is a stacked card, so it stays left-aligned.
                  textAlign: isDesktop ? (textRight ? 'left' : 'right') : 'left',
                }}
              >
                <Reveal>
                  <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', letterSpacing: '.14em', color: dark ? 'var(--clay-light)' : 'var(--clay)' }}>
                    {sv.n}
                  </div>
                  <div className="script" style={{ fontSize: isDesktop ? 44 : 34, lineHeight: .95, color: dark ? 'var(--cream)' : 'var(--bark)', marginTop: 10 }}>
                    {sv.title}
                  </div>
                </Reveal>
                <Reveal as="p" delay={150} style={{
                  margin: '18px 0 0',
                  font: `300 ${isDesktop ? 15 : 14}px/1.75 'Hanken Grotesk', sans-serif`,
                  color: dark ? 'rgba(231,220,203,.82)' : 'var(--ink)',
                  textWrap: 'pretty',
                }}>
                  {sv.body}
                </Reveal>
              </div>
            );
            // mobile is always photo-then-copy; desktop alternates the pair
            if (!isDesktop) return [photo, copy];
            return textRight ? [photo, copy] : [copy, photo];
          })}
        </div>
      </div>

      {/* 04 OUR PROCESS
          A collage rather than a list. Each step places a large photograph that
          bleeds off one page edge, a text column opposite it, and a smaller
          photograph dropped on a second row — every one at a different size and
          vertical offset, so nothing lines up and the eye keeps moving.

          The geometry below is hand-tuned per step on purpose. A mirrored
          template would read as a pattern, which is exactly what the collage is
          trying to avoid, so resist the urge to derive it from an index.

          Mobile collapses to photo → text → photo → text. The second, smaller
          photograph is desktop-only: stacked, it would put two images back to
          back and break that alternation. */}
      <div {...section('our-process', { background: 'var(--sand2)', padding: `${isDesktop ? 84 : 52}px ${px}px ${isDesktop ? 96 : 56}px` })}>
        <Head num="04" title="our process" fs={isDesktop ? 60 : 42} align="right" />

        {isDesktop ? (
          <div style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            columnGap: 24,
            alignItems: 'start',
          }}>
            {PROCESS_ITEMS.map((it, i) => {
              const pr = STORY.process[it.step];
              if (it.kind === 'text') {
                return (
                  <div key={`t${i}`} style={{
                    gridColumn: it.col, gridRow: it.row, marginTop: it.mt,
                    textAlign: it.align, position: 'relative', zIndex: 4,
                  }}>
                    <Reveal>
                      <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', letterSpacing: '.14em', color: 'var(--clay)' }}>
                        {pr.step}
                      </div>
                      <div className="script" style={{ fontSize: 42, lineHeight: .95, color: 'var(--bark)', marginTop: 10 }}>
                        {pr.title}
                      </div>
                    </Reveal>
                    <Reveal as="p" delay={150} style={{
                      margin: '16px 0 0', maxWidth: 420,
                      marginLeft: it.align === 'right' ? 'auto' : 0,
                      font: "300 15px/1.75 'Hanken Grotesk', sans-serif",
                      color: 'var(--ink)', textWrap: 'pretty',
                    }}>
                      {pr.body}
                    </Reveal>
                  </div>
                );
              }
              const isBig = it.kind === 'big';
              return (
                <PhotoFrame
                  key={`p${i}`}
                  img={isBig ? pr.img : pr.img2}
                  overlay={LIGHT_OVERLAY}
                  drift={isBig ? 54 : 40}
                  float={it.float}
                  style={{
                    gridColumn: it.col, gridRow: it.row, height: it.h, marginTop: it.mt,
                    ...(it.bleed ? { [it.bleed === 'left' ? 'marginLeft' : 'marginRight']: -px } : {}),
                    position: 'relative', zIndex: it.z, borderRadius: 3,
                  }}
                >
                  {isBig && <div className="phcap">{pr.step}</div>}
                </PhotoFrame>
              );
            })}
          </div>
        ) : (
          /* mobile keeps the simple alternation: photo → copy → photo → copy.
             The bridges are a desktop device; stacked they'd just be more
             photographs in a column. */
          <div style={{ marginTop: 30 }}>
            {STORY.process.map((pr, i) => (
              <div key={pr.step}>
                <PhotoFrame img={pr.img} overlay={LIGHT_OVERLAY} drift={44} float={0}
                  style={{ height: 240, marginLeft: -px, marginRight: -px }}>
                  <div className="phcap">{pr.step}</div>
                </PhotoFrame>
                <div style={{ padding: `26px 0 ${i === STORY.process.length - 1 ? 0 : 46}px` }}>
                  <Reveal>
                    <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', letterSpacing: '.14em', color: 'var(--clay)' }}>{pr.step}</div>
                    <div className="script" style={{ fontSize: 34, lineHeight: .95, color: 'var(--bark)', marginTop: 10 }}>{pr.title}</div>
                  </Reveal>
                  <Reveal as="p" delay={150} style={{ margin: '16px 0 0', font: "300 14px/1.75 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textWrap: 'pretty' }}>
                    {pr.body}
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 05 OUR TEAM */}
      <div {...section('our-team', { background: 'var(--bark)', color: 'var(--sand)', padding: `${isDesktop ? 72 : 44}px ${px}px` })}>
        <div style={{ display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Head num="05" title="our team" dark fs={isDesktop ? 60 : 42} />
          <Reveal delay={150} style={{ font: "300 15px/1.5 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.8)', textTransform: 'lowercase', maxWidth: 320, textAlign: isDesktop ? 'right' : 'left', marginTop: isDesktop ? 0 : 14, paddingBottom: isDesktop ? 10 : 0 }}>
            {STORY.teamTagline}
          </Reveal>
        </div>
        <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3,1fr)' : '1fr', gap: isDesktop ? 24 : 20 }}>
          {TEAM.map((m, i) => (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {m.img ? (
                <PhotoFrame img={m.img} drift={40} float={0} style={{ height: isDesktop ? 320 : 300, borderRadius: 4 }} />
              ) : (
                <div className="ph" style={{ height: isDesktop ? 320 : 300, borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 22, background: 'linear-gradient(150deg,#2c241d,#3a2e25 60%,#4a3628)' }}>
                  <span className="mono" style={{ font: '400 11px ui-monospace, Menlo, monospace', color: 'rgba(231,220,203,.5)', textTransform: 'lowercase' }}>/ photo /</span>
                </div>
              )}
              <Reveal delay={i * 120}>
                <div className="script" style={{ fontSize: 30, color: 'var(--oat)', marginTop: 16 }}>{m.name}</div>
                <div className="mono" style={{ font: '400 11px ui-monospace, Menlo, monospace', color: 'var(--clay-light)', textTransform: 'lowercase', letterSpacing: '.08em', marginTop: 4 }}>{m.role}</div>
                <p style={{ margin: '10px 0 0', font: "300 13.5px/1.55 'Hanken Grotesk', sans-serif", color: 'rgba(231,220,203,.75)', textTransform: 'lowercase' }}>{m.line}</p>
              </Reveal>
            </div>
          ))}
        </div>

        {/* fallback — not sure whom to call */}
        <div style={{ marginTop: isDesktop ? 56 : 40, paddingTop: isDesktop ? 40 : 30, borderTop: '1px solid rgba(231,220,203,.16)', display: 'flex', flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'baseline' : 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <Reveal className="script" style={{ fontSize: isDesktop ? 40 : 30, color: 'var(--oat)' }}>need on-call support?</Reveal>
          <Reveal
            as="a"
            delay={150}
            href={`tel:${STORY.teamFallbackPhone.replace(/\s/g, '')}`}
            style={{ font: `500 ${isDesktop ? 24 : 20}px 'Hanken Grotesk', sans-serif`, letterSpacing: '.02em', color: 'var(--clay-light)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--clay-light)')}
          >
            call: {STORY.teamFallbackPhone}
          </Reveal>
        </div>
      </div>

      {/* 06 CONTACT */}
      <div {...section('contact', { background: 'var(--oat)', padding: `${isDesktop ? 72 : 48}px ${px}px` })}>
        <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, gap: 56, alignItems: 'start' }}>
          <div style={{ gridColumn: isDesktop ? 2 : undefined, textAlign: 'right' }}>
            <Head num="06" title="let's plan yours" fs={isDesktop ? 60 : 44} align="right" />
            <Reveal as="p" delay={150} style={{ margin: '16px 0 0 auto', font: "300 16px/1.6 'Hanken Grotesk', sans-serif", color: 'rgba(41,33,28,.6)', textTransform: 'lowercase', maxWidth: 420 }}>
              tell us where your mind wanders – we'll shape the rest, and stay with you the whole way.
            </Reveal>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ marginTop: 22, display: 'inline-flex', width: 30, height: 30, color: 'var(--bark)' }} aria-label="instagram">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <div style={{ marginTop: 18, font: "300 13px 'Hanken Grotesk', sans-serif", color: 'rgba(41,33,28,.5)', textTransform: 'lowercase' }}>or write to us at</div>
            <a
              href="mailto:hey@trippintravels.in"
              style={{ display: 'inline-block', marginTop: 4, font: "400 16px 'Hanken Grotesk', sans-serif", color: 'var(--clay)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bark)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--clay)')}
            >
              hey@trippintravels.in
            </a>
          </div>
          <EnquiryForm style={{ gridColumn: isDesktop ? 1 : undefined, gridRow: isDesktop ? 1 : undefined, marginTop: isDesktop ? 8 : 32 }} />
        </div>
      </div>

      <SiteFooter isDesktop={isDesktop} onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
