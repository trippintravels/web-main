# Trippin' Travels — design philosophy

Bespoke travel in the Eastern Himalaya, for a Gen-Z / Gen-Alpha audience. The
site should feel like an editorial travel journal that happens to be a website:
unhurried, photographic, warm. Playful in voice, restrained in motion.

The guiding line is the one in the hero: **the mountains don't rush — and
neither do we.** When a choice is between "energetic" and "calm", pick calm.

---

## Voice

- Lowercase throughout for UI and headings. Sentence case only inside long-form
  body copy taken verbatim from the brand doc.
- Sassy but on-brand — confident, never try-hard. "go beyond the trails",
  "not sure whom to call?", "the fixer".
- Brand name is **Trippin' Travels**, with the apostrophe, everywhere it appears
  as a name. (Long-form doc copy in `data.js` is quoted verbatim and is the one
  exception.)
- Second person. We take things off the reader's plate; we don't sell to them.

## Palette

Defined once as CSS variables in `index.css`. Never hardcode a hex outside it.

| Token | Use |
| --- | --- |
| `--oat` | default page ground |
| `--sand`, `--sand2` | alternating section bands |
| `--bark`, `--bark-deep` | dark bands, footer |
| `--ink` | body copy on light ground |
| `--clay`, `--clay-light` | the only accent — CTAs, numerals, links |
| `--cream` | type on photography |

Sections alternate ground colour to segment the page — oat → sand → oat →
sand2 → bark. Dark bands are punctuation, not the default.

## Type

- **Cinzel** — the wordmark only (`.wordmark`), uppercase, wide tracking.
- **Pinyon Script** — display headings (`.script`). Large, tight leading
  (`.82–.95`), used at genuinely large sizes. Never for body copy.
- **Hanken Grotesk** — everything else. Weight 300 for body, 500 for labels.
- **ui-monospace** — numerals, eyebrows, captions, step markers (`.mono`).

Section headings carry a numbered eyebrow (`00 — get right to it`). The number
is clay; it is what makes the page read as an index rather than a brochure.

## Layout

- Full-bleed photography, text inset at 72px (desktop) / 26px (mobile).
- Alternate alignment down the page so the eye zig-zags — sections alternate
  left / right, and destination rows alternate which edge the photo bleeds to.
- Two hand-written breakpoints, not a framework: a single 900px switch between
  `MobileHome` / `DesktopHome`, mirrored by `isDesktop` on the story page.
- Inline styles for layout; `index.css` for anything shared, stateful, or
  animated.

## Motion

Two systems, both scroll-driven, both one shared engine rather than per-element
listeners, and both disabled under `prefers-reduced-motion`.

### 1. Photo parallax — `parallax.js`

Continuous, tied to scroll position. The image drifts vertically *inside* its
clipped frame (`drift`), and the frame itself floats over the page at its own
rate (`float`). Full-bleed photos use `float={0}` so no gap opens at the seam;
framed cards float. One rAF loop drives every registered frame.

### 2. Text reveal — `reveal.js` + `Reveal.jsx`

Discrete, one-shot. Text rests at `opacity: 0` and fades in over **1.25s ease**
the first time it enters the viewport — then **stays**, permanently. It never
replays on scroll-back.

This mirrors the entrance animation on the Eloura reference, which we matched
deliberately after reading its implementation:

- Elementor's `fadeIn`: `@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`
  at `animation-duration: 1.25s`.
- **Pure opacity — no translate.** Every animated element on the Eloura homepage
  uses `_animation: "fadeIn"`; the vertical drift there is its separate scroll
  parallax, which is our system 1. Don't conflate them.
- One-shot via `IntersectionObserver`, which calls `unobserve()` the moment it
  fires.
- Staggered per element with delays of 200 / 400 / 600ms.

Our conventions:

- **Text only.** Photos already carry the parallax; fading them too is
  double-motion. Reveal headings, body copy, list items, buttons.
- **Never put `.reveal` on anything with a background colour** — the band would
  fade in with the text. Reveal the text inside it instead.
- **Stagger within a section, not down the page.** A heading at `0`, its
  supporting line at `150`, list items at `i * 120`. Sections don't wait on the
  section above them.
- Above-the-fold content fades in on load, because the observer fires
  immediately for anything already in view. That's intended — the hero should
  arrive, not blink into place.
- Reduced motion resolves to `opacity: 1` with no animation. Content must never
  be left stranded at `opacity: 0`.

Usage — `Reveal` renders one element and nothing else, so it stands in for the
node it replaces rather than wrapping it:

```jsx
<Reveal className="script" style={{ fontSize: 60 }}>our process</Reveal>
<Reveal as="p" delay={150} style={{ margin: 0 }}>{body}</Reveal>
```

### Everything else

Hover and focus transitions stay under 300ms. The one piece of looping motion
on the site is the hero's circular arrow CTA (`.hero-cta`) — deliberately the
only thing that moves on its own, so it reads as the single invitation to act.

## Destinations

Three levels, each with a distinct job. Routes are hash-based so GitHub Pages
needs no rewrites: `#/destinations/<region>` and `#/destinations/<region>/<zone>`.

1. **Landing** (`where to wander`) — the four regions, each with an underlined
   clay `explore` link.
2. **Region** (`RegionPage`) — the map is the subject. A zone index sits beside
   it on desktop, below it on mobile. Hovering either the map or a list row
   lights up both; they are two readings of the same four zones.
3. **Zone** (`ZonePage`) — hero with a breadcrumb up to the region, the zone
   intro, then one photo + text card per sight, an optional featured band, and a
   `plan <zone>` CTA.

Rules that keep this coherent as regions are added:

- **Mobile region pages have no hero photo.** The map is the hero; a full-bleed
  photo would push it below the fold. This is the one place the site
  deliberately opens without photography.
- **Map geometry is lifted, never re-derived.** Each map's outlines only line up
  in the coordinate space they were composed in, so the `viewBox` travels with
  the data in `src/maps/`. North bengal's outlines carry per-zone `translate`
  offsets; sikkim's are absolute. Don't reposition zones piecemeal.
- **The map is one CSS state machine.** Each zone group drives its own fill
  through `--zf`, so hover and the active zone share a single rule (`.mz-g`).
- **Hero gradients are weighted to the bottom** (`HERO_OVERLAY`), because that's
  where the eyebrow and title sit. Type must stay legible whatever photograph
  lands behind it.
- **Never emit a dead link.** `LIVE_REGIONS` in `data.js` is the single switch:
  a region not listed there renders as plain text in the nav, footer and landing
  page rather than a link to nothing. Add a slug when its page ships.
- **Sight copy is verbatim and complete.** Names and bodies are the full text of
  the brand doc — every paragraph, generated from the `.docx` rather than
  retyped. `body` and `intro` are arrays, one entry per paragraph, rendered as
  separate `<p>`s. Photo captions and list blurbs are ours; long-form copy keeps
  its sentence case, everything around it stays lowercase.
- **Long intros split, they don't truncate.** A zone's opening paragraph is the
  desktop hero standfirst (per 9b) and the remainder falls into the band below;
  mobile keeps the whole intro in that band. Nothing from the doc is dropped.

## Imagery

Moody, atmospheric, mountain-first. Every photo tile carries a gradient overlay
(`.ph-grad`) so `--cream` type stays legible on top, plus a lowercase monospace
caption (`.phcap`) bottom-left. Photography is currently picsum placeholders via
`img(id)` in `data.js` — the ids match the original mockup, so swapping in real
photography is a one-line change per image.
