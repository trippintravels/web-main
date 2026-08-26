// Shared scroll-triggered entrance engine.
//
// Mirrors Elementor's entrance animations (as used on the Eloura site):
//   - an element rests at opacity 0
//   - the first time it enters the viewport it fades in over 1.25s
//   - it is then unobserved, so it never replays on scroll-back
//
// One IntersectionObserver serves every registered element, so N text blocks
// cost one observer rather than N scroll listeners. Elements already in the
// viewport on load fire immediately, which is what gives the hero its
// on-load fade. Disabled under prefers-reduced-motion.

const reduce =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Per-element stagger, in ms (Eloura uses 200 / 400 / 600).
const delays = new WeakMap();

let observer = null;

function ensureObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        observer.unobserve(el); // one-shot: stays revealed once shown
        const d = delays.get(el) || 0;
        if (d) setTimeout(() => el.classList.add('in'), d);
        else el.classList.add('in');
      }
    },
    // Hold the reveal until the block is a little way into the viewport, so it
    // fades as you arrive at it rather than while it's still clipped by the edge.
    { rootMargin: '0px 0px -8% 0px' },
  );
  return observer;
}

// Register an element to fade in on first view. Returns an unregister fn.
export function registerReveal(el, delay = 0) {
  if (!el) return () => {};
  // No motion (or no observer support): show it immediately, never hidden.
  if (reduce || typeof IntersectionObserver === 'undefined') {
    el.classList.add('in');
    return () => {};
  }
  delays.set(el, delay);
  const o = ensureObserver();
  o.observe(el);
  return () => o.unobserve(el);
}
