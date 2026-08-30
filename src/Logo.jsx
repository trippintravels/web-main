// The circular mark, painted in whatever colour its parent is using.
//
// The source PNG is white on transparent, so dropping it in as an <img> would
// make it invisible on the light grounds — the region page's mobile header puts
// the wordmark in --bark on oat. Driving a CSS mask from its alpha instead means
// the mark always matches the text beside it, on photography or on oat.
export default function Logo({ size = 20, style }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flex: 'none',
        background: 'currentColor',
        WebkitMaskImage: "url('/logo-mark-sm.png')",
        maskImage: "url('/logo-mark-sm.png')",
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        ...style,
      }}
    />
  );
}
