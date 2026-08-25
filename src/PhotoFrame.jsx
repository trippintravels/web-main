import { useEffect, useRef } from 'react';
import { registerParallax } from './parallax.js';

// Default gradient overlay (matches the darker one baked into the old `.ph`
// background shorthand). Destination tiles pass a lighter overlay.
const DEFAULT_OVERLAY = 'linear-gradient(180deg,rgba(20,16,12,.22),rgba(20,16,12,.55))';

// A photo frame with Eloura-style scroll motion: the image drifts inside the
// clipped frame while the frame floats over the page. `children` (captions,
// hero text) render above the image + overlay, exactly as before.
export default function PhotoFrame({
  img,
  overlay = DEFAULT_OVERLAY,
  drift = 56,
  float = 22,
  focus = 'center',
  className = '',
  style,
  children,
}) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(
    () => registerParallax(frameRef.current, imgRef.current, { drift, float }),
    [drift, float],
  );

  return (
    <div
      ref={frameRef}
      className={`ph${className ? ' ' + className : ''}`}
      style={{ '--ph-drift': `${drift}px`, ...style }}
    >
      <div ref={imgRef} className="ph-img" style={{ backgroundImage: `url('${img}')`, backgroundPosition: focus }} />
      <div className="ph-grad" style={{ backgroundImage: overlay }} />
      {children}
    </div>
  );
}
