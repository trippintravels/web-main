import { useEffect, useRef } from 'react';
import { registerScale } from './parallax.js';

// The logo blown up as texture behind the story hero, swelling slowly as you
// scroll past it.
//
// The source PNG is white on transparent, so painting it directly would make it
// invisible on anything pale. Instead its alpha channel drives a CSS mask and
// the colour comes from `tint` — which means the same file works on oat, on
// bark, or over photography, and always in a palette colour.
//
// Kept very faint on purpose: at full strength it reads as a stamped logo,
// which looks cheap. At 5–7% it reads as texture, which is the whole point.
export default function Watermark({
  tint = 'var(--cream)',
  opacity = 0.06,
  size = '86%',
  from = 1,
  to = 1.28,
  style,
}) {
  const ref = useRef(null);

  useEffect(() => registerScale(ref.current, { from, to }), [from, to]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 2,
        ...style,
      }}
    >
      <div
        ref={ref}
        style={{
          width: size,
          aspectRatio: '1 / 1',
          maxWidth: 900,
          background: tint,
          opacity,
          WebkitMaskImage: "url('/logo-mark.png')",
          maskImage: "url('/logo-mark.png')",
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
