# Trippin' Travels — Public Site

The public marketing site for **Trippin' Travels**, a bespoke travel + car-rental
operator in **North Bengal / the Eastern Himalaya**, aimed at a Gen-Z / Gen-Alpha
audience. It's a single-page React/Vite app served at **`trippintravels.in`** — a
browsable showcase of regions, zones and offbeat hamlets, an "our story" page, and an
enquiry drawer that relays leads to WhatsApp.

> This README covers the **public site only** (the repo root / `src/`). The internal
> **admin app** (`admin/`) and the **Worker's admin API** are documented separately in
> **`admin/README.md`**; the partner-settlement money model is in **`MONEY_FLOW.md`**.

---

## 1. Stack & hosting

- **Framework:** React 19 + **Vite** (SPA). Deps are just `react` / `react-dom`; dev
  tooling is `vite`, `@vitejs/plugin-react`, `gh-pages`, `playwright`.
- **Hosting:** static build on **GitHub Pages** → **`trippintravels.in`** (the `base`
  in `vite.config.js` is `/`, i.e. an apex domain, not a project sub-path).
- **Routing:** **hash-based** (`#/…`) so it's GitHub-Pages-safe (no server rewrites)
  and still deep-linkable.
- **Enquiry backend:** a Cloudflare **Worker** (`enquiry-notifier`) receives form
  submissions and relays them to WhatsApp. Its source lives in `worker/` (see also
  `admin/README.md`, which shares that Worker for the admin API).

---

## 2. Repo layout

```
web-main/                 (monorepo)
├── index.html            Vite entry; self-hosted display font + favicons + Google fonts
├── vite.config.js        React plugin, base '/'
├── src/                  ← THIS SITE
│   ├── main.jsx          mounts <App/>
│   ├── App.jsx           viewport split (900px), hash routing, overlays (menu/drawer)
│   ├── route.js          hash router: parseHash / useRoute / navigate + slug helpers
│   ├── data.js           homepage content, nav/footer, services, process, story, contact
│   ├── destinations.js   regions → zones → sights (verbatim copy; see §4)
│   ├── offbeat.js        offbeat & unexplored hamlets (level-2 + level-3 content)
│   ├── maps/             SVG map geometry per region (northBengal, sikkim, dooars, offbeat)
│   ├── lib/sendEnquiry.js POST to the notifier Worker (contract documented in-file)
│   ├── index.css         the whole design system / palette / responsive switch
│   └── *.jsx             pages & components (see §5)
├── public/               static assets shipped as-is (photos, fonts, favicons)
├── DESIGN.md             the *why* — palette, type, motion, voice
├── INSTRUCTIONS.md       the *how* — picking the repo up cold
├── admin/                internal admin app (separate — see admin/README.md)
└── worker/               Cloudflare Worker (enquiry notifier + admin API)
```

---

## 3. Pages & routing (`route.js`, `App.jsx`)

`App.jsx` renders one of these based on the hash, and chooses a **desktop or mobile**
variant via `useIsDesktop()` (a `(min-width: 900px)` media query, matching `index.css`):

| Hash | Page |
|---|---|
| `#/` (or anything unmatched) | **Home** — `DesktopHome` / `MobileHome` |
| `#/our-story` · `#/our-story/<section>` | **Our story** — `StoryPage` (scrolls to the section anchor) |
| `#/destinations/<region>` | **Region** — `RegionPage` (hero + interactive `ZoneMap` + zone index) |
| `#/destinations/<region>/<zone>` | **Zone** — `ZonePage` (intro + sights) |
| `#/destinations/offbeat-unexplored` | **Offbeat register** — `OffbeatPage` (its own `OffbeatMap`, a scatter of hamlets, not zones) |
| `#/destinations/offbeat-unexplored/<hamlet>` | **Hamlet** — `HamletPage` (level-3 page) |

- **Regions** are registered in the `REGIONS` map in `App.jsx` (`north-bengal`,
  `sikkim`, `dooars`) paired with their map geometry; **`offbeat-unexplored`** is the
  odd one out (hamlets instead of zones) so it has its own page + map. Add a region by
  adding it to `REGIONS` **and** to `LIVE_REGIONS` in `data.js` — routing and every
  menu pick it up. Unknown region/zone slugs fall back rather than render blank.
- Navigation goes through `navigate(hash)` (re-emits `hashchange` on a repeat click so
  the same section re-scrolls). Body scroll is locked (with scrollbar-width compensation)
  while the mobile menu or enquiry drawer is open.

---

## 4. Content model

Content is data-driven so copy/photos swap without touching components:

- **`data.js`** — homepage "where to wander" rows (`DESTINATIONS`), `SERVICES`,
  `PROCESS`, `EXPEDITIONS` / `EXPERIENCES` / `RENTALS`, `NAV`, `FOOTER`, `STORY`, and
  shared contact/social (`CONTACT_EMAIL = hey@trippintravels.in`, `INSTAGRAM_URL`).
  `LIVE_REGIONS` + `destinationHref(slug)` gate which destination links are live.
- **`destinations.js`** — `NORTH_BENGAL`, `SIKKIM`, `DOOARS`, each `{ slug, name, intro,
  heroImg, zones:[{ slug, name, blurb, sights:[…] }] }`. Sight bodies are the **complete
  verbatim text** generated from `design_ins/.../destinations.docx` (one array entry per
  paragraph) — not retyped.
- **`offbeat.js`** — `OFFBEAT` with `hamlets:[{ slug, coord, blurb, body:[…] }]`; each
  hamlet carries its **map-pin coordinate** so the numbered pins and the field index
  stay in lock-step. Copy is verbatim from the "Offbeat" section of the content doc.
- **`maps/*.js`** — per-region SVG geometry (zone shapes / pin positions) consumed by
  `ZoneMap` / `OffbeatMap`.
- **Photos** — self-hosted under `public/photos/` (`placeholder/<id>.jpg` using the
  mockup's picsum ids, and `story/<name>.jpg`). They ship with the build so the site
  can't lose imagery to a third-party outage; swapping in real photography is a one-file
  change per image.

---

## 5. Key components

- **Home:** `DesktopHome.jsx` / `MobileHome.jsx` + `DesktopNav` / `MobileNav` /
  `MobileTopBar`.
- **Destinations:** `RegionPage` → `ZoneMap` (interactive region map) → `ZonePage`;
  `OffbeatPage` → `OffbeatMap` → `HamletPage`.
- **Our story:** `StoryPage.jsx`.
- **Enquiry:** `EnquiryDrawer` (shared overlay, intent dropdown + prefill) wrapping
  `EnquiryForm`, with `Turnstile.jsx` for anti-spam (see §6).
- **Shared / chrome:** `SiteFooter`, `Logo` / `Brandmark` / `Watermark`, `PhotoFrame`
  (parallax image frame; see `parallax.js`), `Reveal` (scroll-reveal wrapper;
  `reveal.js`), `BackLink` / `ExploreLink` / `InstagramLink`.

---

## 6. Enquiry flow (`lib/sendEnquiry.js`)

The enquiry form posts to the notifier Worker, which relays the lead to WhatsApp.

- **Request:** `POST <VITE_NOTIFIER_URL>` with `content-type: application/json` and
  `x-api-key: <VITE_NOTIFIER_KEY>`; body `{ name, phone, email, intent, where, message }`
  (all strings). Any 2xx is success (empty/204 is fine); a 12s timeout stops the button
  spinning forever.
- **Anti-spam:** Cloudflare **Turnstile** (`VITE_TURNSTILE_SITEKEY`).
- **The API key is public** (VITE vars are inlined into the client bundle) — it's a bot
  speed-bump, not auth. Real defense (Origin check, rate-limit, body cap) lives in the
  Worker; never put a WhatsApp token in a `VITE_` var.
- **Graceful fallback:** if `VITE_NOTIFIER_URL` / `VITE_NOTIFIER_KEY` are unset
  (`isNotifierConfigured()` is false), the form doesn't fail — it invites people to
  **email `hey@trippintravels.in`** instead.

---

## 7. Design & conventions

- **The design is documented in `DESIGN.md` (the *why*) and `INSTRUCTIONS.md` (the
  *how*)** — palette, type, motion, voice, and how to pick the repo up cold. Keep both
  in sync when the design changes.
- **Type:** self-hosted **Great Vibes** (display, preloaded `.woff2`, `font-display:
  block` so headings never flash a fallback) + Google **Cinzel** and **Hanken Grotesk**.
- **Styling:** one design system in `src/index.css` (palette tokens + the 900px
  desktop/mobile switch); components use CSS vars (e.g. `var(--clay)`), not inline hex.
- **Voice:** Gen-Z / Gen-Alpha, lowercase, playful-but-on-brand (see `DESIGN.md`).

---

## 8. Develop, build & deploy

```bash
npm install
npm run dev        # Vite dev server
npm run build      # → dist/
npm run preview    # serve the build locally
npm run deploy     # build + gh-pages -d dist   (manual publish to GitHub Pages)
```

- **CI:** `.github/workflows/deploy.yml` builds and publishes to **GitHub Pages** on
  every push to `main` (and on manual dispatch).
- **Build-time env** (inlined by Vite; set as GitHub Actions secrets for prod, or a
  local `.env` for dev): `VITE_NOTIFIER_URL`, `VITE_NOTIFIER_KEY`, `VITE_TURNSTILE_SITEKEY`.
  All optional — unset just means the enquiry form points people at email.
- **DNS:** `trippintravels.in` is on **Cloudflare DNS**, pointing the apex at GitHub
  Pages; `admin.trippintravels.in` is a separate surface (Cloudflare Pages + Worker).

---

## 9. Related docs

- **`admin/README.md`** — the internal admin app + Cloudflare Worker **admin API**
  (bookings, payments, expenses, settlements, D1/R2).
- **`MONEY_FLOW.md`** — the partner revenue-split / settlement money model and its edge
  cases (admin side).
- **`DESIGN.md`** / **`INSTRUCTIONS.md`** — this site's design philosophy and working guide.
