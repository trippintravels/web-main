# Working on this repo

How to pick the site up cold. `DESIGN.md` is the *why* — palette, type, motion,
the reasoning behind each page's layout. This is the *how*: rules, the map, the
traps, and what's still open.

Read this first, then `DESIGN.md` before changing anything visual.

---

## Rules

**`design_ins/` is reference, not source.** Gitignored, large, and full of a
mirrored third-party site. Open a file only when it's named — never browse or
grep it speculatively. It holds the Eloura mirror (the design reference), the
mockup canvas `Trippin Travels.dc.html` (artboards live in it as `id="5d"`,
`"9a"` etc.), `uploads/destinations.docx` (all destination copy), and
`graphics/logo-png.png`.

**Never commit or push.** The repo belongs to a temporary GitHub account; the
local git user `akashchauhanweb` is read-only. Akash pushes from VS Code. Write
the commit message, leave the commit alone.

**Deploy is automatic** — GitHub Actions builds and publishes `dist/` to Pages
on any push to `main`. Custom domain `trippintravels.in`, DNS at Namecheap (not
Cloudflare). Pages source must stay "GitHub Actions".

**Verify visually, always.** `npm run build && npm run preview`, then drive it
with Playwright. Screenshot both breakpoints. Do not report a visual change as
done without looking at it.

**Safari can't be tested here.** Playwright's browsers aren't installed — only
system Chrome via `channel: 'chrome'`. At least one real bug (Pinyon glyphs
clipping) reproduced *only* in Safari and measured perfectly clean in Chrome. If
Akash reports something you cannot reproduce, believe the report before the
measurement.

---

## Map

Two breakpoints, switched at 900px by `useIsDesktop()` in `App.jsx`. Most
components take `isDesktop` and branch inline; there is no CSS framework.

| | |
| --- | --- |
| `App.jsx` | hash routing, viewport switch, drawer + mobile-menu state |
| `route.js` | `#/our-story/<section>`, `#/destinations/<region>/<zone>` |
| `data.js` | **single source of truth** — regions, nav, footer, story copy, dial codes, `LIVE_REGIONS` |
| `destinations.js` | region → zone → sight content, **generated from the .docx** |
| `maps/` | zone-map geometry, one file per region |
| `PhotoFrame` + `parallax.js` | every photo; `drift` moves the image, `float` moves the frame |
| `Reveal` + `reveal.js` | one-shot fade-in on first view |
| `Brandmark` / `Logo` | brand lockup; `Logo` is a CSS mask so it takes the parent's colour |
| `MobileTopBar` | the wordmark + hamburger strip on every page under 900px; `floating` lifts it over a hero photograph, plain otherwise |
| `EnquiryForm` | the whole form, shared by the drawer and the story page |
| `GallerySlab` + `.knit` | the story page's moving photo slab — see DESIGN.md motion §4 |
| `public/photos/story/` | the story page's real photography, named by the slot it fills |
| `public/photos/placeholder/` | self-hosted mockup imagery for every other page, named by its original picsum id |
| `used/` | gitignored archive of the drive originals, plus `MAPPING.md` |
| `worker/` | Cloudflare Worker; deployed separately with `wrangler`, never by the site build |

Pages: `DesktopHome`/`MobileHome`, `StoryPage`, `RegionPage`, `ZonePage`.

---

## Traps

Each of these cost real time. They are not obvious from reading the code.

**Every `.reveal` is its own stacking context** (its opacity animation creates
one). A `z-index` on a child can never escape it — put it on the `.reveal`
wrapper. This is why links under the big script headings were unclickable.

**Script headings overhang their box.** `.script` carries a left padding with a
cancelling negative margin, marked `!important`. Safari clips glyph overhang to
the element's bounds; Chrome doesn't. Don't remove it because nothing looks
wrong — nothing looks wrong in Chrome.

**Screenshot diffing is noisy** while picsum images load. Always take a control
(same shot twice, no change) before trusting a comparison. Two "findings" were
reported from this noise before the control was added.

**Reveals need ~2.2s to settle** after scrolling (1.25s animation + up to 300ms
stagger). Asserting earlier reports false "stuck" elements. Also use
`waitUntil: 'load'`, not `networkidle` — Turnstile holds a connection open.

**Vite inlines `VITE_*` at build time.** Editing `.env` mid-session does nothing
until the dev server restarts, and GitHub Actions needs the same values as
**repository** secrets (the build job declares no environment, so environment
secrets are invisible to it).

**Destination copy is generated, never typed.** It comes out of
`uploads/destinations.docx` via a throwaway Python script. Retyping risks silent
drift from the brand doc — regenerate instead.

**Playwright's element screenshot scrolls the element into view first.** So
`el.screenshot()` silently moves the page before it captures, which invalidates
anything measured against scroll position — two "the animation isn't working"
conclusions came from this and both were wrong. For scroll-driven work, scroll,
then `page.screenshot({ clip })`. Same family: `elementFromPoint` only sees the
current viewport, so scroll a thing into view before hit-testing whether it is
covered.

**The gallery slab has one load-bearing inequality.** Each column must stay
taller than its window across the whole travel, or a gap opens at an edge
mid-loop. DESIGN.md motion §4 states it; the aspect ratios in `data.js` are what
can break it. Re-check after reordering the gallery.

**Captions overflow small frames silently.** `.phcap` has no width constraint,
so a long caption runs past its tile — the hero-row frames are only ~106px wide
on a phone. Keep those under about 12 characters and measure rather than guess.

**Pulling from the shared drive.** The folder page only renders its first 50
items; `https://drive.google.com/embeddedfolderview?id=<id>#list` returns the
lot. `thumbnail?id=<id>&sz=w1400` gives a JPEG at any size — and will happily
hand back a still frame for a *video* without saying so, which is how two `.MOV`
files ended up used as photographs. `uc?export=download&id=<id>` gives the true
original. Check the magic bytes before trusting a file is a photo.

**Nothing fetches an image from another domain.** All photography ships with
the build. It used to come from picsum at page load, and when picsum went down
the landing page and every destination page lost their imagery to someone else's
outage while our-story, already on local files, was untouched. Two `img()`
helpers point at `public/photos/placeholder/` — one in `data.js`, one in
`destinations.js` — and they have to be changed together.

**`LIVE_REGIONS` in `data.js` is the dead-link switch.** A region not listed
renders as plain text in the nav, footer and landing page instead of a link to
nothing. Add a slug only when its page exists.

---

## State

Built and working: landing page, our story, three region pages (north bengal,
sikkim, dooars) with zone pages under each, the enquiry form end-to-end
(Turnstile → Worker → Resend → inbox).

### Open

**Content**
- `offbeat & unexplored` — no content, deliberately unlinked. Its copy has
  started in the .docx, but **the "Offbeat" heading there is malformed** and
  extracts as raw XML. Fix the document before generating.
- Team photos — `TEAM[].img` is `null` for all three, rendering `/ photo /` tiles.
- Photography: the **our-story page is real** (`public/photos/story/`, 29
  frames from the shared drive). Every other page is still on the mockup's
  placeholder imagery, but **self-hosted** now (`public/photos/placeholder/`,
  21 files) rather than fetched from picsum. Swapping in real photography is
  still one line per image.
- Two frames on the story page — `row-3` and `gallery-10` — are single stills
  pulled from QuickTime **videos**; there is no still original for either. See
  `used/story_page/MAPPING.md`.
- Seven "Our Story" frames from the drive went unused: 2, 4, 8, 13, 20, 21, 24.
  21 (prayer flags over a roadside nursery) is the strongest of them and the
  obvious candidate if service 04 ever gets replaced.

**Enquiry / infra**
- Add repository secrets so the deployed form submits: `VITE_NOTIFIER_URL`,
  `VITE_NOTIFIER_KEY`, `VITE_TURNSTILE_SITEKEY`. Without them the build still
  succeeds and the form quietly falls back to "write to us at …".
- Rotate the Turnstile secret — it briefly sat in a file bound for the public
  bundle. Then `wrangler secret put TURNSTILE_SECRET`.
- Drop `localhost:5173` / `localhost:4173` from the Worker's `ALLOWED_ORIGINS`
  once production is confirmed, and redeploy.
- WhatsApp notification is parked. The Worker's fan-out is already shaped for a
  second channel; the research is in the runbook artifact.

**Keep this file in step with `DESIGN.md`.** They are a pair: DESIGN.md carries
the reasoning, this one carries the rules, the map and the traps. A change worth
recording in one is usually worth a line in the other.
