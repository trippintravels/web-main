import { INSTAGRAM_URL } from './data.js';

// The Instagram glyph and the link around it — drawn three times before this
// existed: the footer, the mobile menu and the story page's contact block.
//
// The href, the `rel` and the label belong with the mark rather than at each
// call site. A copy that quietly loses `rel="noreferrer"` looks identical and
// isn't, which is exactly the kind of drift a hand-repeated anchor invites.
//
// The glyph inherits `color`, so the same mark sits on the bark footer and on
// the oat contact band; `size` drives the anchor and the artwork together.
export default function InstagramLink({ size = 30, color = 'var(--sand)', style }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="instagram"
      style={{ display: 'inline-flex', width: size, height: size, color, ...style }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
