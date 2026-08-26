import { useState } from 'react';
import PhotoFrame from './PhotoFrame.jsx';
import DesktopNav from './DesktopNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Reveal from './Reveal.jsx';
import { STORY, TEAM, INTENT_OPTIONS, INSTAGRAM_URL } from './data.js';
import { slugify } from './route.js';

const LIGHT_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.10),rgba(20,16,12,.28))';

const SECTIONS = [
  { num: '01', label: 'about us' },
  { num: '02', label: 'gallery' },
  { num: '03', label: 'our services' },
  { num: '04', label: 'our process' },
  { num: '05', label: 'our team' },
  { num: '06', label: 'contact' },
].map((s) => ({ ...s, slug: slugify(s.label) }));

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
      <Eyebrow dark={dark}>{num} — {title}</Eyebrow>
      <div className="script" style={{ fontSize: fs, color: dark ? 'var(--oat)' : 'var(--bark)', lineHeight: .9, marginTop: 6 }}>
        {title}
      </div>
    </Reveal>
  );
}

/* inline intent dropdown for the contact form (mirrors the enquiry drawer) */
function IntentField() {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState(null);
  return (
    <div style={{ position: 'relative' }}>
      <div
        className="uline"
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpen((v) => !v))}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: intent ? 'var(--bark)' : 'rgba(41,33,28,.4)' }}
      >
        {intent ? intent.label : "i'm interested in…"}
        <span style={{ fontSize: 12, color: 'var(--clay)' }}>{open ? '▲' : '▾'}</span>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)',
            background: 'var(--cream)', border: '1px solid rgba(41,33,28,.12)',
            borderRadius: 10, boxShadow: '0 18px 36px -18px rgba(41,33,28,.5)',
            zIndex: 6, overflow: 'hidden', animation: 'fadeIn .18s ease',
          }}
        >
          {INTENT_OPTIONS.map((opt, i) => (
            <div
              key={opt.key}
              onClick={() => { setIntent(opt); setOpen(false); }}
              style={{
                padding: '15px 18px', font: "400 15px 'Hanken Grotesk', sans-serif",
                textTransform: 'lowercase', color: 'var(--bark)', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : '1px solid rgba(41,33,28,.08)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ece3d3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */

export default function StoryPage({ isDesktop, onHome, onMenu, onStory, onRegion }) {
  const px = isDesktop ? 72 : 26;
  const scrollMt = isDesktop ? 78 : 64; // keep anchors clear of the sticky index

  const section = (slug, extra) => ({ id: slug, style: { scrollMarginTop: scrollMt, ...extra } });

  return (
    <div style={{ background: 'var(--oat)', position: 'relative', overflow: 'hidden' }}>
      {/* HERO */}
      <div style={{ position: 'relative' }}>
        <PhotoFrame img={STORY.heroImg} drift={isDesktop ? 80 : 36} float={0} focus="center 22%" style={{ height: isDesktop ? 560 : 600 }}>
          <div className="phcap">the team · somewhere off the map</div>
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${isDesktop ? 38 : 46}px ${px}px ${isDesktop ? 54 : 40}px` }}>
            <Reveal className="script" style={{ fontSize: isDesktop ? 150 : 96, lineHeight: .82, color: 'var(--cream)' }}>
              {isDesktop ? 'our story' : <>our<br />story</>}
            </Reveal>
          </div>
        </PhotoFrame>

        {/* top bar — shared desktop nav (with mega-menu), hamburger on mobile */}
        {isDesktop ? (
          <DesktopNav onStory={onStory} onWordmark={onHome} onRegion={onRegion} active="story" />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: `46px ${px}px 20px` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
              <span className="wordmark" onClick={onHome} style={{ fontSize: 17, color: 'var(--oat)', cursor: 'pointer' }}>
                trippin' travels
              </span>
              <button onClick={onMenu} aria-label="Open menu" style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', background: 'none', border: 0, padding: 4 }}>
                <span style={{ width: 22, height: 1.5, background: 'var(--oat)' }} />
                <span style={{ width: 22, height: 1.5, background: 'var(--oat)' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INTRO band */}
      <div style={{ background: 'var(--bark)', color: 'var(--sand)', padding: `${isDesktop ? 64 : 44}px ${px}px`, display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '200px 1fr' : undefined, gap: 40, alignItems: 'start' }}>
        <Reveal style={{ font: "600 11px 'Hanken Grotesk', sans-serif", letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--clay-light)', paddingTop: isDesktop ? 12 : 0, marginBottom: isDesktop ? 0 : 18 }}>
          trippin travels
        </Reveal>
        <Reveal as="p" delay={150} style={{ margin: 0, font: `300 ${isDesktop ? 30 : 20}px/1.5 'Hanken Grotesk', sans-serif`, color: 'var(--cream)', textWrap: 'pretty', maxWidth: 900 }}>
          {STORY.intro}
        </Reveal>
      </div>

      {/* SECTION INDEX (sticky) */}
      <div style={{ position: 'sticky', top: 0, zIndex: 25, background: 'var(--oat)', borderBottom: '1px solid rgba(41,33,28,.12)' }}>
        <div style={{ display: 'flex', gap: isDesktop ? 34 : 20, padding: `${isDesktop ? 18 : 14}px ${px}px`, overflowX: 'auto', font: "400 12px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', letterSpacing: '.03em' }}>
          {SECTIONS.map((s) => (
            <span key={s.slug} onClick={() => onStory(s.slug)} style={{ cursor: 'pointer', whiteSpace: 'nowrap', color: 'rgba(41,33,28,.6)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bark)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(41,33,28,.6)')}
            >
              <span className="mono" style={{ color: 'var(--clay)', marginRight: 6 }}>{s.num}</span>{s.label}
            </span>
          ))}
        </div>
      </div>

      {/* 01 ABOUT US */}
      <div {...section('about-us', { background: 'var(--oat)', padding: `${isDesktop ? 72 : 44}px ${px}px`, display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, gap: 56, alignItems: 'center' })}>
        <div>
          <Head num="01" title="about us" fs={isDesktop ? 64 : 44} />
          <Reveal as="p" delay={150} style={{ margin: '18px 0 0', font: `300 ${isDesktop ? 17 : 15}px/1.7 'Hanken Grotesk', sans-serif`, color: 'var(--ink)', textWrap: 'pretty' }}>
            {STORY.aboutUs}
          </Reveal>
        </div>
        <PhotoFrame img={STORY.aboutImg} overlay={LIGHT_OVERLAY} drift={60} float={isDesktop ? 26 : 0} style={{ height: isDesktop ? 460 : 260, borderRadius: 4, marginTop: isDesktop ? 0 : 26 }} />
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

      {/* 03 OUR SERVICES */}
      <div {...section('our-services', { background: 'var(--oat)', padding: `${isDesktop ? 72 : 44}px ${px}px` })}>
        <div style={{ display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Head num="03" title="our services" fs={isDesktop ? 60 : 42} />
          <Reveal delay={150} style={{ font: "300 15px/1.5 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textTransform: 'lowercase', maxWidth: 300, textAlign: isDesktop ? 'right' : 'left', marginTop: isDesktop ? 0 : 14, paddingBottom: isDesktop ? 10 : 0 }}>
            {STORY.servicesTagline}
          </Reveal>
        </div>
        <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: `${isDesktop ? 40 : 30}px 56px` }}>
          {STORY.services.map((s, i) => (
            <Reveal key={s.n} delay={(i % 2) * 120}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'var(--clay)' }}>{s.n}</span>
                <span className="script" style={{ fontSize: isDesktop ? 32 : 28, color: 'var(--bark)' }}>{s.title}</span>
              </div>
              <p style={{ margin: '10px 0 0', font: "300 14.5px/1.65 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textWrap: 'pretty' }}>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 04 OUR PROCESS */}
      <div {...section('our-process', { background: 'var(--sand2)', padding: `${isDesktop ? 72 : 44}px ${px}px` })}>
        <Head num="04" title="our process" fs={isDesktop ? 60 : 42} align="right" />
        <div style={{ marginTop: 34 }}>
          {STORY.process.map((p) => (
            <Reveal key={p.step} style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 280px' : undefined, gap: isDesktop ? 56 : 0, alignItems: 'start', padding: isDesktop ? '26px 0' : '20px 0', textAlign: 'right' }}>
              <div style={{ gridColumn: isDesktop ? 2 : undefined, gridRow: isDesktop ? 1 : undefined }}>
                <div className="mono" style={{ font: '400 12px ui-monospace, Menlo, monospace', color: 'var(--clay)', letterSpacing: '.1em' }}>{p.step}</div>
                <div style={{ font: "500 20px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'var(--bark)', marginTop: 8 }}>{p.title}</div>
              </div>
              <p style={{ gridColumn: isDesktop ? 1 : undefined, gridRow: isDesktop ? 1 : undefined, margin: isDesktop ? 0 : '10px 0 0', font: "300 15px/1.7 'Hanken Grotesk', sans-serif", color: 'var(--ink)', textWrap: 'pretty' }}>{p.body}</p>
            </Reveal>
          ))}
        </div>
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
              tell us where your mind wanders — we'll shape the rest, and stay with you the whole way.
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
          <form onSubmit={(e) => e.preventDefault()} style={{ gridColumn: isDesktop ? 1 : undefined, gridRow: isDesktop ? 1 : undefined, display: 'flex', flexDirection: 'column', gap: 28, marginTop: isDesktop ? 8 : 32 }}>
            <input className="uline" placeholder="your name" />
            <input className="uline" placeholder="email" />
            <IntentField />
            <input className="uline" placeholder="tell us your dream trip" />
            <button className="pill" style={{ alignSelf: 'flex-start', font: "500 13px 'Hanken Grotesk', sans-serif", color: 'var(--oat)', background: 'var(--clay)', padding: '15px 30px' }}>
              send enquiry
            </button>
          </form>
        </div>
      </div>

      <SiteFooter isDesktop={isDesktop} onStory={onStory} onHome={onHome} onRegion={onRegion} />
    </div>
  );
}
