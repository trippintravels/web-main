import { OFFBEAT_MAP } from './maps/offbeat.js';

// The offbeat field map — a static two-state base map (west bengal + sikkim,
// real geometry) with a numbered pin dropped on each hamlet's true position.
//
// Unlike ZoneMap there are no fillable zones: the interaction is the pins,
// which light in sync with the field index below it and open the hamlet's
// level-3 page. `active` is the hovered hamlet's number (its `n`, e.g. "07");
// `onHover(n | null)` reports the pin under the pointer so the page can light
// the matching index row, and vice versa; `onPick(slug)` opens the hamlet.
// Geometry, offsets and the stroke widths are lifted from the mockup; see the
// note in src/maps/offbeat.js.
//
// Fill and pin colours live in index.css (.ofmap / .mk) so the map is one CSS
// state machine. Per-group stroke width is set here because it lives in each
// group's own (pre-scale) coordinate space, not the page's.
export default function OffbeatMap({ hamlets, active, onHover, onPick, label }) {
  const { viewBox, ellipse, labels, contours } = OFFBEAT_MAP;
  return (
    <svg className="ofmap" viewBox={viewBox} role="img" aria-label={label}>
      {/* soft haze pooling the cluster together, behind the land */}
      <ellipse className="ofmap-sea" cx={ellipse.cx} cy={ellipse.cy} rx={ellipse.rx} ry={ellipse.ry} />

      {contours.map((g, gi) => (
        <g key={gi} transform={g.transform}>
          {g.paths.map((p, pi) => (
            <path
              key={pi}
              className={`land land-${g.region}`}
              d={p.d}
              transform={p.transform}
              strokeWidth={g.strokeWidth}
            />
          ))}
        </g>
      ))}

      {labels.map((l, i) => (
        <text
          key={i}
          className="oflbl"
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          style={{ '--l': l.dim, fontSize: l.size }}
        >
          {l.text}
        </text>
      ))}

      {hamlets.map((h) => {
        const num = String(Number(h.n)); // "07" → "7", matching the mockup pins
        return (
          <g
            key={h.n}
            className={`mk${active === h.n ? ' active' : ''}`}
            role="link"
            tabIndex={0}
            aria-label={h.name}
            onMouseEnter={() => onHover(h.n)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(h.n)}
            onBlur={() => onHover(null)}
            onClick={() => onPick(h.slug)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick(h.slug))}
          >
            <title>{num} · {h.name}</title>
            <circle className="mko" cx={h.pin.cx} cy={h.pin.cy} r="13" />
            <circle className="mkd" cx={h.pin.cx} cy={h.pin.cy} r="4.5" />
            <text className="mkt" x={h.pin.tx} y={h.pin.ty} textAnchor={h.pin.anchor || 'start'} style={{ fontSize: 26 }}>
              {num}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
