// Interactive zone map for a region page.
//
// Geometry, translate offsets and label anchors all come from the mockup
// composition (see src/maps/*.js) — the zones only line up in that exact
// coordinate space, so the viewBox travels with the data rather than being
// recomputed here. Hover/active fill lives in index.css (.mz-g) so the whole
// map is one CSS state machine rather than per-zone inline styles.
export default function ZoneMap({ viewBox, zones, active, onPick, label }) {
  return (
    <svg className="mapsvg" viewBox={viewBox} role="group" aria-label={label}>
      {zones.map((z) => {
        const on = z.slug === active;
        return (
          <g
            key={z.slug}
            className={`mz-g${on ? ' active' : ''}`}
            role="link"
            tabIndex={0}
            aria-label={`${z.name} — ${z.count} sights`}
            onClick={() => onPick(z.slug)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick(z.slug))}
          >
            {/* north bengal's outlines each carry their own offset; sikkim's are
                already in absolute coordinates, so translate is optional */}
            <g transform={z.translate ? `translate(${z.translate})` : undefined}>
              <path d={z.d} />
            </g>
            {/* sikkim's zones are compass quarters, so the map says "north" where
                the list says "North Sikkim" — mapLabel carries that short form */}
            <text className="mz-lbl" x={z.label.x} y={z.label.y} textAnchor="middle" style={{ fontSize: z.label.size }}>
              {z.mapLabel || z.name}
            </text>
            <text className="mz-num" x={z.label.x} y={z.label.y + (z.label.numDy ?? 27)} textAnchor="middle" style={{ fontSize: z.label.numSize }}>
              {z.count} sights
            </text>
          </g>
        );
      })}
    </svg>
  );
}
