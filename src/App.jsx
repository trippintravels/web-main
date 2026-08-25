import { useState, useEffect } from 'react';
import MobileHome from './MobileHome.jsx';
import DesktopHome from './DesktopHome.jsx';
import MobileNav from './MobileNav.jsx';
import EnquiryDrawer from './EnquiryDrawer.jsx';
import StoryPage from './StoryPage.jsx';
import { useRoute, navigate, toStory } from './route.js';

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

  const openPlan = () => { setNavOpen(false); setDrawerOpen(true); };

  return (
    <>
      {route.page === 'story' ? (
        <StoryPage isDesktop={isDesktop} onHome={goHome} onMenu={() => setNavOpen(true)} onStory={goStory} />
      ) : isDesktop ? (
        <DesktopHome onPlan={openPlan} onStory={goStory} />
      ) : (
        <MobileHome onMenu={() => setNavOpen(true)} onPlan={openPlan} onStory={goStory} />
      )}

      {/* Mobile-only full-screen menu (5c) */}
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} onPlan={openPlan} onStory={goStory} />

      {/* Shared enquiry drawer with working intent dropdown */}
      <EnquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
