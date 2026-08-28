import { useState, useEffect } from 'react';
import MobileHome from './MobileHome.jsx';
import DesktopHome from './DesktopHome.jsx';
import MobileNav from './MobileNav.jsx';
import EnquiryDrawer from './EnquiryDrawer.jsx';
import StoryPage from './StoryPage.jsx';
import RegionPage from './RegionPage.jsx';
import ZonePage from './ZonePage.jsx';
import { NORTH_BENGAL, SIKKIM, DOOARS } from './destinations.js';
import { NB_MAP } from './maps/northBengal.js';
import { SK_MAP } from './maps/sikkim.js';
import { DK_MAP } from './maps/dooars.js';
import { useRoute, navigate, toStory, toDestination } from './route.js';

// Regions that have pages. Add an entry here (and its slug to LIVE_REGIONS in
// data.js) when a new region ships; routing and every menu pick it up.
const REGIONS = {
  [NORTH_BENGAL.slug]: { region: NORTH_BENGAL, map: NB_MAP },
  [SIKKIM.slug]: { region: SIKKIM, map: SK_MAP },
  [DOOARS.slug]: { region: DOOARS, map: DK_MAP },
};

// Track viewport against the 900px breakpoint (matches index.css switch)
function useIsDesktop() {
  const query = '(min-width: 900px)';
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

export default function App() {
  const isDesktop = useIsDesktop();
  const route = useRoute();
  const [navOpen, setNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPrefill, setDrawerPrefill] = useState(null);

  // Scroll behaviour on route change: jump to a section anchor, or top of page.
  // rAF + a short fallback let the target page render before we scroll to it.
  useEffect(() => {
    if (route.page === 'story' && route.section) {
      let tries = 0;
      const go = () => {
        const el = document.getElementById(route.section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (tries++ < 10) setTimeout(go, 40);
      };
      requestAnimationFrame(go);
    } else {
      window.scrollTo(0, 0);
    }
  }, [route.page, route.section]);

  // Navigate to an "our story" section (closing the mobile menu first).
  const goStory = (slug) => { setNavOpen(false); navigate(toStory(slug)); };
  const goHome = () => navigate('#/');
  const goRegion = (slug) => { setNavOpen(false); navigate(toDestination(slug)); };
  const goZone = (regionSlug, zoneSlug) => { setNavOpen(false); navigate(toDestination(regionSlug, zoneSlug)); };

  // Resolve the destination route against what's actually built. An unknown
  // region or zone falls back rather than rendering a blank page.
  const entry = route.region ? REGIONS[route.region] : null;
  const zone = entry && route.zone
    ? entry.region.zones.find((z) => z.slug === route.zone)
    : null;

  // Lock body scroll while an overlay is open. Compensate for the scrollbar
  // width so full-width / centered content doesn't shift when it disappears.
  useEffect(() => {
    const locked = navOpen || drawerOpen;
    if (locked) {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [navOpen, drawerOpen]);

  // Some call sites pass onPlan straight to onClick, so the first argument may
  // be a DOM event rather than a prefill — only accept the real shape.
  const isPrefill = (v) => Boolean(v && typeof v === 'object' && ('where' in v || 'message' in v));
  const openPlan = (prefill) => {
    setNavOpen(false);
    setDrawerPrefill(isPrefill(prefill) ? prefill : null);
    setDrawerOpen(true);
  };

  return (
    <>
      {route.page === 'story' ? (
        <StoryPage isDesktop={isDesktop} onHome={goHome} onMenu={() => setNavOpen(true)} onStory={goStory} onRegion={goRegion} />
      ) : zone ? (
        <ZonePage
          region={entry.region}
          zone={zone}
          isDesktop={isDesktop}
          onHome={goHome}
          onMenu={() => setNavOpen(true)}
          onStory={goStory}
          onRegion={goRegion}
          onPlan={openPlan}
        />
      ) : entry ? (
        <RegionPage
          region={entry.region}
          map={entry.map}
          isDesktop={isDesktop}
          onHome={goHome}
          onMenu={() => setNavOpen(true)}
          onStory={goStory}
          onRegion={goRegion}
          onZone={(z) => goZone(entry.region.slug, z)}
        />
      ) : isDesktop ? (
        <DesktopHome onPlan={openPlan} onStory={goStory} onHome={goHome} onRegion={goRegion} />
      ) : (
        <MobileHome onMenu={() => setNavOpen(true)} onPlan={openPlan} onStory={goStory} onHome={goHome} onRegion={goRegion} />
      )}

      {/* Mobile-only full-screen menu (5c) */}
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} onPlan={openPlan} onStory={goStory} onHome={() => { setNavOpen(false); goHome(); }} onRegion={goRegion} />

      {/* Shared enquiry drawer with working intent dropdown */}
      <EnquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} prefill={drawerPrefill} />
    </>
  );
}
