import { useState, useEffect } from 'react';
import MobileHome from './MobileHome.jsx';
import DesktopHome from './DesktopHome.jsx';
import MobileNav from './MobileNav.jsx';
import EnquiryDrawer from './EnquiryDrawer.jsx';

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
  const [navOpen, setNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      {isDesktop ? (
        <DesktopHome onPlan={openPlan} />
      ) : (
        <MobileHome onMenu={() => setNavOpen(true)} onPlan={openPlan} />
      )}

      {/* Mobile-only full-screen menu (5c) */}
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} onPlan={openPlan} />

      {/* Shared enquiry drawer with working intent dropdown */}
      <EnquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
