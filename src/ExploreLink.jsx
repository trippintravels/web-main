// The "explore" affordance under each destination on the landing page.
//
// Renders a real anchor as soon as `href` is set. Until the per-destination
// pages exist, destinationHref() returns null and this renders a span with
// identical styling — deliberately not announced as a link, so screen readers
// aren't told about a destination that doesn't go anywhere yet. Wiring it up
// later is a one-line change in data.js; nothing here needs to move.
export default function ExploreLink({ href, label = 'explore', style }) {
  const Tag = href ? 'a' : 'span';
  return (
    <Tag className="explore-link" href={href || undefined} style={style}>
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
      </svg>
    </Tag>
  );
}
