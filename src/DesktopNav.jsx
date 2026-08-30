import { useState } from 'react';
import { NAV, LIVE_REGIONS } from './data.js';
import { slugify } from './route.js';
import Brandmark from './Brandmark.jsx';

// Shared desktop top nav + mega-menu, used by both the home and story pages so
// the dropdowns and frosted-glass header behave identically everywhere.

const GLASS_BG = 'rgba(33,26,21,.72)';
const GLASS_BLUR = 'blur(18px) saturate(120%)';

// Panel spans from the very top (behind the transparent nav bar) so a single
// backdrop-filter frosts the whole header — no seam between bar and panel.
const megaPanel = {
  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
  background: GLASS_BG, backdropFilter: GLASS_BLUR, WebkitBackdropFilter: GLASS_BLUR,
  padding: '118px 72px 40px',
  boxShadow: '0 24px 50px -20px rgba(20,16,12,.6)',
};
const megaLabel = { font: "600 10px 'Hanken Grotesk', sans-serif", letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--clay-light)' };
const megaItem = { cursor: 'pointer' };
const megaGrid = (cols) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '16px 30px', marginTop: 20, font: "300 17px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', color: 'rgba(241,235,224,.85)' });

export default function DesktopNav({ onStory, onWordmark, onRegion, active }) {
  const [panel, setPanel] = useState(null); // 'exp' | 'tours' | 'story' | null
  const toggle = (p) => setPanel((cur) => (cur === p ? null : p));

  // Expedition items only become clickable once their region page exists.
  const regionProps = (x) => {
    const slug = slugify(x);
    if (!onRegion || !LIVE_REGIONS.has(slug)) return { style: { ...megaItem, cursor: 'default' } };
    return { style: megaItem, onClick: () => { setPanel(null); onRegion(slug); } };
  };

  const navItem = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
  const caret = { fontSize: 9, color: 'var(--oat)' };
  const storyItem = active === 'story'
    ? { ...navItem, color: 'var(--cream)', borderBottom: '1px solid var(--cream)', paddingBottom: 2 }
    : navItem;

  return (
    <>
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '38px 72px 20px', background: 'transparent',
        }}
      >
        <Brandmark fontSize={24} size={42} onClick={onWordmark} />
        <div style={{ display: 'flex', gap: 38, font: "400 14px 'Hanken Grotesk', sans-serif", textTransform: 'lowercase', letterSpacing: '.03em', color: 'rgba(241,235,224,.92)' }}>
          <span style={navItem} onClick={() => toggle('exp')}>expeditions <span style={caret}>▾</span></span>
          <span style={navItem} onClick={() => toggle('tours')}>tours &amp; rentals <span style={caret}>▾</span></span>
          <span style={storyItem} onClick={() => toggle('story')}>our story <span style={caret}>▾</span></span>
        </div>
      </div>

      {panel === 'exp' && (
        <div style={megaPanel}>
          <div style={megaLabel}>expeditions</div>
          <div style={megaGrid(4)}>
            {NAV.expeditions.map((x) => <span key={x} {...regionProps(x)}>{x}</span>)}
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
          <div style={megaGrid(3)}>{NAV.story.map((x) => (
            <span key={x} style={megaItem} onClick={() => { setPanel(null); onStory(slugify(x)); }}>{x}</span>
          ))}</div>
        </div>
      )}
    </>
  );
}
