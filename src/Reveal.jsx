import { useEffect, useRef } from 'react';
import { registerReveal } from './reveal.js';

// Fades its content in the first time it scrolls into view (see reveal.js).
//
// Renders a single element and nothing else, so it can stand in for the node it
// replaces without changing layout — pass `as` for the tag, plus the same
// className/style you'd have used. `delay` staggers siblings within a section.
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => registerReveal(ref.current, delay), [delay]);

  return (
    <Tag ref={ref} className={`reveal${className ? ' ' + className : ''}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}
