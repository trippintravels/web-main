# Trippin' Travels — design philosophy

Bespoke travel in the Eastern Himalaya, for a Gen-Z / Gen-Alpha audience. The
site should feel like an editorial travel journal that happens to be a website:
unhurried, photographic, warm. Playful in voice, restrained in motion.

The guiding line is the one in the hero: **the mountains don't rush – and
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
- The contact details are brand data, not page copy — `INSTAGRAM_URL` and
  `CONTACT_EMAIL` in `data.js`, drawn by the footer, the mobile menu and the
  story page's contact block. The Instagram mark is one component
  (`InstagramLink`) carrying the glyph, the link and its `rel` together, so a
  copy can't quietly lose one of the three.

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
  It is **self-hosted and preloaded** (`public/fonts/`, `font-display: block`)
  rather than fetched from Google. It carries every heading on the site, and
  waiting on the Google stylesheet before the font was even discovered left a
  visible window of fallback type. Don't move it back to a CDN.
  Its ink also **overflows its layout box** — an initial g, j or p swings a
  swash up to ~0.55em left of the text origin, and the tight leading pushes
  ascenders and descenders past the line box. Safari clips that overhang to the
  element's own bounds where Chrome doesn't, so `.script` carries a left padding
  cancelled by an equal negative margin. Text position is unaffected. Don't
  remove it because "nothing looks wrong" — nothing looks wrong in Chrome.
- **Hanken Grotesk** — everything else. Weight 300 for body, 500 for labels.
- **ui-monospace** — numerals, eyebrows, captions, step markers (`.mono`).

Section headings carry a numbered eyebrow (`00 – get right to it`). The number
is clay; it is what makes the page read as an index rather than a brochure.

## Layout

- Full-bleed photography, text inset at 72px (desktop) / 26px (mobile).
- Alternate alignment down the page so the eye zig-zags — sections alternate
  left / right, and destination rows alternate which edge the photo bleeds to.
- Two hand-written breakpoints, not a framework: a single 900px switch between
  `MobileHome` / `DesktopHome`, mirrored by `isDesktop` on the story page.
- The mobile header is one component (`MobileTopBar`) and its geometry — 46px
  from the top, the 26px gutter, a 24px row — is fixed inside it rather than
  passed in. The full-screen menu redraws the brand lockup over the page's own,
  and the swap only reads as a panel opening instead of a page replacing itself
  if the two land on exactly the same point. Move both or neither. Region pages
  run the bar in normal flow in `--bark`: they are the one page that opens
  without a hero photograph, so there is nothing to sit the cream lockup on.
- The nav and the footer are two readings of the same index, so they carry the
  same four sections in the same order — expeditions, experiences, tours &
  rentals, our story. Add a section to one and it belongs in the other.
  Both are width-critical at four sections: the top bar tapers its gap and type
  between 900 and 1080px, and the footer's brand column takes `2fr` so the
  script wordmark holds one line. See the trap in `INSTRUCTIONS.md`.
- Inline styles for layout; `index.css` for anything shared, stateful, or
  animated.

## Motion

Four systems. The first two are scroll-driven and share one rAF loop rather
than per-element listeners; the last two run on their own clock. All four
resolve to a deliberate static state under `prefers-reduced-motion` — never a
frozen mid-animation frame.

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

### 3. Ambient drift — `.watermark-mark`

The logo behind the story hero swells and settles on a 15s loop, independent of
scroll. It was scroll-driven at first, which was wrong: it is texture, not a
scroll indicator, and it stalled whenever the reader did. Slow and alternating
so it never resolves into a pulse; reduced motion parks it at a chosen size
rather than a frozen frame.

### 4. The gallery slab — `.knit`

The story page's gallery is four columns packed edge to edge with no gutter,
alternate columns travelling in opposite directions. Like the watermark it runs
on its own clock, and for the same reason: it is a reel, and on scroll it would
stall whenever the reader did.

Two rules hold the loop together and neither is optional:

- **Each column renders its photographs twice** and the animation moves it by
  exactly one set (`-50%` of a double-length column). At the end of the pass the
  second set sits precisely where the first started, so the wrap is invisible.
  Render the set once and the column runs off its own bottom.
- **The window must never exceed one set's height.** The column is two sets tall
  and travels one, so the region from 0 to one set is always covered — that
  single inequality is the whole guarantee against a gap opening at an edge. The
  clamps in `index.css` sit far under it at every width; re-check if the aspect
  ratios in `data.js` change.

Because it loops, the window does *not* have to be tall enough to show
everything at once — every photograph comes round. That is what lets mobile run
a short frame instead of a tall one.

Column durations are deliberately not multiples of one another, so the columns
never fall back into step. Hovering the slab pauses it, which is also what makes
the captions readable: they fade in on the same hover, because fifteen captions
with no gutters between them is noise.

### Everything else

Hover and focus transitions stay under 300ms. Three things now loop on their own
— the hero's circular arrow CTA (`.hero-cta`), which is the single invitation to
act, the watermark, and the gallery slab. The slab was a deliberate exception to
what used to be a two-loop rule: a gallery that reads as a reel is atmosphere in
the same sense the watermark is, and it earns the exception by being confined to
one section and pausing under the pointer. The bar stays high — anything further
must read as atmosphere or as the one thing to click, and the story page is now
carrying two of the three.

## The story page

Three patterns here were built from the Eloura reference and adapted. Each has a
rule that isn't obvious from the markup.

**The hero doesn't name itself.** No "our story" title — it opens with what the
company is: a centred eyebrow and the brand paragraph over a full-bleed
photograph, with the logo faint behind it. Below, three frames at different
heights, different resting offsets and different scroll speeds, pulled up so
they bite into the bottom of the hero photograph by 88–162px. The mismatch is
the effect; matched speeds would read as one block sliding.

**The service grid is a full-bleed checkerboard.** Every row is one photograph
and one solid block of copy; both the side and the block colour alternate down
the page. It bleeds past the 72px gutter on purpose — inset, it reads as cards
rather than a grid. Colours alternate sand → bark, never clay: clay is the
single accent and a page of clay blocks would spend it. Desktop photographs are
static; the mobile ones drift, which is deliberate and not an oversight.

**The process collage runs on bridges.** Each step is a frame bleeding off one
edge with its copy opposite, and after every step a bridge photograph straddles
the centre, overlapping the frame above it and the frame below. That handoff is
the whole point — without it the steps read as three tidy bands. Two rules hold
it together:

- The gap between a step's frame and its copy is **134px for every step**.
  Photo cols `1/8` against text `9/13`, mirrored as `6/13` against `1/5`.
  Change one column and you must change its pair.
- Bridges deviate from dead centre and vary in width, so the column reads as a
  spread rather than a stack.

The geometry is hand-set per step and must stay that way. Deriving it from an
index is the obvious future "cleanup" and it would turn the collage straight
back into a mirrored pattern, which is the one thing it must not be.

Two traps, both of which caught me while building it:

- **Every item needs an explicit `gridRow`.** Without one they auto-place into a
  row each, so copy can never sit beside its photograph — and pulling anything
  up lands text on top of an image.
- **Overlap comes from negative `mt` on grid items**, which lifts an item and
  shortens its row so everything below follows. That keeps it all in normal
  flow: if the copy grows, rows grow and the handoffs hold.

Photographs may overlap each other freely. **Text may never sit on one** — check
it after any change to the numbers.

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
caption (`.phcap`) bottom-left. The our-story page carries real photography from
`public/photos/story/`. Everywhere else still shows the mockup's placeholder
imagery, self-hosted in `public/photos/placeholder/` and named by its original
mockup id, so swapping in real photography stays a one-line change per image.
Nothing is fetched from another domain: photography that arrives over someone
else's network can vanish on someone else's outage, and it did.

### One exception: the Dooars sketch map

Every other map is traced geometry. The Dooars isn't, and the reason is worth
recording so nobody "corrects" it later.

The Dooars is a floodplain strip spanning Jalpaiguri and Alipurduar districts.
Its three clusters are protected areas — Gorumara, Jaldapara, Buxa — not
administrative units, and they're separated by tea estates, towns and farmland
with nothing on them. Unlike districts or compass quarters they don't
tessellate, and there is no real boundary enclosing them.

So the map shows them as **three disjoint sketch shapes arranged as a
triangle**: western left, eastern right, central below. That keeps the map
roughly square, which matters for two reasons — the labels fit inside the
shapes, and it sits beside the zone list exactly like the other two regions
rather than needing a layout of its own.

- **Only the west-to-east ordering is real.** Positions and outlines are a
  design device. The file header says so; keep it there.
- **Edges come from layered periodic noise** — a couple of large lobes with
  progressively finer ripples on top — so they crinkle like a traced forest
  boundary instead of reading as smooth blobs. Integer frequencies keep the
  outline seamless where it closes.
- An earlier version drew this as a single west-to-east belt. It was abandoned
  because a 10:1 band can't hold labels, forced a bespoke full-width layout, and
  collapsed to ~9px type at phone width. If a region ever tempts you toward a
  very wide map, that's the failure mode to expect.
