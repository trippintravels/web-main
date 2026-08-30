// Shared scroll-driven parallax engine for photo frames.
//
// Mirrors Elementor's scrolling motion effects (as used on the Eloura site):
//   - the inner image glides vertically *within* its clipped frame (image drift)
//   - the frame itself floats over the page at its own rate (frame float)
//
// A single rAF loop drives every registered frame, so N photos cost one
// listener + one animation frame per scroll tick. Disabled under
// prefers-reduced-motion.

const items = new Set();
let running = false;
let ticking = false;

const reduce =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function update() {
  ticking = false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (const it of items) {
    const rect = it.frame.getBoundingClientRect();
    // Undo the float we applied last frame so the frame's own transform
    // doesn't feed back into its measured position (which would compound).
    const top = rect.top - it.lastFloatY;
    let q = (vh - top) / (vh + rect.height); // 0 = just entering, 1 = fully past
    q = q < 0 ? 0 : q > 1 ? 1 : q;
    const t = q - 0.5; // -0.5 … 0.5, centred as the frame crosses the viewport

    // Negative direction: image drifts up as the page scrolls down.
    const imgY = -t * 2 * it.drift;
    it.img.style.transform = `translate3d(0,${imgY.toFixed(2)}px,0)`;

    if (it.float) {
      const fy = -t * 2 * it.float;
      it.frame.style.transform = `translate3d(0,${fy.toFixed(2)}px,0)`;
      it.lastFloatY = fy;
    }
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}

function ensureRunning() {
  if (running) return;
  running = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

// Register a frame + its inner image. Returns an unregister fn for cleanup.
export function registerParallax(frame, img, { drift = 56, float = 22 } = {}) {
  if (reduce || !frame || !img) return () => {};
  const it = { frame, img, drift, float, lastFloatY: 0 };
  items.add(it);
  ensureRunning();
  requestAnimationFrame(update); // position once so there's no first-scroll jump
  return () => {
    items.delete(it);
  };
}
