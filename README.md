# Trippin Travels — Eastern Himalaya

A pixel-faithful React build of the "Trippin Travels" luxury travel homepage
mockup (the 5-series *about-us homepage* — mobile + desktop, with the working
menu overlay, mega-menu dropdowns, and enquiry drawer).

Built with **React 19.2.8** + **Vite**.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## What's included

The site renders one of two layouts depending on viewport width, switching at
the `900px` breakpoint:

- **Mobile (`< 900px`)** — `src/MobileHome.jsx` (mockup 5a). Full-bleed hero,
  edge-bleed magazine "where to wander" grid, ethos, story, services, process,
  the dark "made for you, only" panel, the quote overlay, enquiry CTA, footer.
  Tapping the hamburger opens the full-screen nav overlay (mockup 5c).
- **Desktop (`≥ 900px`)** — `src/DesktopHome.jsx` (mockup 5b). Same content in a
  1280px editorial layout with a top nav whose items open dark mega-menu panels.

Shared, on both layouts:

- **`src/MobileNav.jsx`** — the full-screen menu overlay.
- **`src/EnquiryDrawer.jsx`** — the slide-out "plan your journey" drawer with a
  working intent dropdown (a specific destination / bike or car rental /
  corporate & group trips).

All copy, destinations, services, process steps and nav structure live in
**`src/data.js`**.

## Design tokens

| Token            | Value      | Use                          |
| ---------------- | ---------- | ---------------------------- |
| `--oat`          | `#f1ebe0`  | primary background           |
| `--sand`         | `#e7dccb`  | story band                   |
| `--sand2`        | `#efe6d6`  | process band                 |
| `--bark`         | `#29211c`  | dark panels / ink            |
| `--bark-deep`    | `#211a15`  | footer / nav overlay         |
| `--clay`         | `#a9674c`  | primary accent / CTA         |
| `--clay-light`   | `#c98e6f`  | eyebrows on dark             |
| `--cream`        | `#f6f1e7`  | hero display type            |

Type: **Pinyon Script** (display cursive), **Hanken Grotesk** (body / UI),
`ui-monospace` (captions & data). Loaded from Google Fonts in `index.html`.

## Notes

- Hero and section imagery use the same `picsum.photos` ids as the original
  mockup so the site reads identically. Swap the `img()` urls in `src/data.js`
  with your own photography for production.
- Nav links and destination items are presentational (matching the mockup) —
  wire them to routes/anchors as needed.
