# Trippin Travels — Admin & Backend

Internal admin + backend for **Trippin Travels**, a travel + car-rental operator in North Bengal / the Eastern Himalaya. This is an **admin-only** surface (no public writes): the owners/partners record bookings, payments, fleet documents, expenses, and settle revenue between themselves. Everything derived (nets, pending amounts, statuses, expiry alerts, revenue, settlement figures) is **computed on the frontend** — the database stores raw inputs only.

The public marketing site (`trippintravels.in`) is a separate React/Vite app in this same repo and is **not** covered here except where it shares infrastructure.

---

## 1. Architecture at a glance

```
web-main/                 (monorepo)
├── src/                  public marketing site (React/Vite, GitHub Pages, trippintravels.in)
├── worker/               the API (Cloudflare Worker)
│   ├── src/
│   │   ├── index.js      existing: public enquiry → WhatsApp/email notifier
│   │   ├── admin.js      admin router: auth guard + generic CRUD + sub-routers
│   │   ├── bookings.js   travel/car bookings, hotels, payments, nextId
│   │   ├── finance.js    expenses, split-config, settlements
│   │   └── files.js      R2 upload / fetch / delete
│   ├── migrations/       D1 SQL migrations (0001 … 0004)
│   └── wrangler.toml     D1 + R2 bindings, routes
└── admin/                the admin app (React/Vite) — deploys to admin.trippintravels.in
    ├── public/
    └── src/
        ├── App.jsx       mounts the shell
        ├── app.js        shell HTML + nav + client-side router + mobile drawer
        ├── api.js        fetch helpers (get/post/patch/del/upload/fileUrl/fetchBlobUrl/deleteFile)
        ├── icons.js      shared inline-SVG icon set
        ├── index.css     the whole design system, scoped to #dash-root
        ├── dashboard.js  Dashboard screen (built)
        ├── dashlib.js    pure computeD() — dashboard math, unit-tested
        ├── partners.js   Partners screen (built)
        ├── cars.js       Cars screen (built)
        ├── drivers.js    Drivers screen (built)
        ├── carbookings.js Car bookings screen (built)
        ├── travelbookings.js Travel bookings screen (built)
        ├── payments.js   Payments screen (built)
        ├── expenses.js   Expenses screen (built)
        ├── settlelib.js  pure settlement engine (cash-basis), unit-checked vs live data
        └── settlements.js Settlements screen (built)
```

**Surfaces & hosting**
- **Backend:** Cloudflare **Worker** (serverless), data in **D1** (SQLite), files in **R2** (object storage). All free-tier.
- **Admin app:** static React/Vite build, served at **`admin.trippintravels.in`**.
- **DNS:** already migrated Namecheap → **Cloudflare DNS** (all records preserved & verified).

**Auth**
- **Production:** Cloudflare **Access** (Zero Trust, free ≤50 users) in front of `admin.*`, **email OTP** (typed email, no password). Access injects a signed JWT header on every request.
- **Development:** a bearer token. The Worker checks `Authorization: Bearer <ADMIN_DEV_TOKEN>`; the admin app sends `VITE_ADMIN_TOKEN`.
- **TODO (not done yet):** swap the dev-token guard for Access JWT verification in `admin.js`, and set up the Access application + email OTP policy. Build everything against the dev token for now.

**Named resources**
- D1 database name: **`trippin-admin`** (binding `DB`).
- R2 bucket: **`trippin-docs`** (binding `DOCS`).
- Owner email / first partner: `akash.chauhan.web@gmail.com`.

---

## 2. Current status

| Area | Status |
|---|---|
| DNS → Cloudflare | ✅ done |
| D1 schema + seed (car_models) | ✅ done (migrations 0001–0004) |
| Worker API (admin.js, bookings.js, finance.js, files.js) | ✅ built & deployed |
| R2 wired (upload/fetch/delete) | ✅ done |
| Admin shell (App.jsx, app.js, routing, mobile drawer) | ✅ done |
| **Dashboard** screen | ✅ built |
| **Partners** screen (users + revenue splits + history) | ✅ built |
| **Cars** screen (fleet + documents + images) | ✅ built |
| **Drivers** screen (CRUD + docs + guarded hard-delete/reassign) | ✅ built |
| **Car bookings** screen (standalone + travel-origin, flat/distance, FE amount/net) | ✅ built |
| **Travel bookings** screen (customer + hotels + money + optional fleet car, FE net, cancel cascade) | ✅ built |
| **Payments** screen (record against travel/car booking, FE pending/paid) | ✅ built |
| **Expenses** screen (car/travel category, paid-by partner, pot totals) | ✅ built |
| **Settlements** screen (per month/partner, cash-basis engine, settle/un-settle) | ✅ built |
| Settlements screen | ⛔ pending |
| Dashboard "link" actions wired to their screens | ✅ done (via `tt-nav` event) |
| Cloudflare Access (prod auth) + swap dev token | ⛔ pending |
| Seed real users/partners & real fleet | ⛔ pending |

---

## 3. Data model (Cloudflare D1 / SQLite)

**Conventions (hold everywhere):**
- **Money** = `INTEGER` **rupees**, never floats.
- **Dates** = `TEXT` ISO `YYYY-MM-DD`. **Timestamps** = `TEXT` ISO via `datetime('now')`.
- **Booleans** = `INTEGER` 0/1.
- Columns ending **`_key`** hold a **Cloudflare R2 object key**.
- `CHECK` constraints enforce enums at the DB.
- **The DB stores inputs only.** Net, pending, paid, status colours, expiry alerts, monthly revenue, and settlement figures are all derived on the frontend.

**Migrations**
- `0001_init.sql` — full schema below (13 tables).
- `0002_seed_car_models.sql` — 178 `INSERT OR IGNORE` make/model rows (seeded from `cars_india.json`).
- `0003_car_extra_docs.sql` — `ALTER TABLE cars ADD COLUMN extra_docs TEXT;` (JSON array of labelled extra documents).
- `0004_car_image.sql` — `ALTER TABLE car_models ADD COLUMN image_url TEXT;` + `UPDATE`s pointing Innova Crysta (id 64) and Dzire (id 8) at their R2 keys.
- `0005_booking_cancel.sql` — adds `cancelled` (0/1), `cancelled_at`, `cancel_reason` to **both** `car_bookings` and `travel_bookings`. Cancelled bookings are kept on record but excluded from all pot/pending/revenue math (FE). Car UI is wired; travel UI wires later (dashlib already excludes cancelled travel).
- `0006_travel_car_cost.sql` — `ALTER TABLE travel_bookings ADD COLUMN car_cost INTEGER NOT NULL DEFAULT 0;` — the transfer price a travel booking pays its car pot (entered beside cost_except_car); drives the two-pot split (see §5).

### Reference & people

**`car_models`** — catalogue (reference data; make dropdown → filters model dropdown).
`id` (keeps JSON ids), `make`, `model`, `body_type`, `fuel_types` (JSON array), `status` (default `on_sale`), `image_url` (R2 key — added 0004), `UNIQUE(make, model)`.

**`cars`** — the fleet. Bookings reference **only** these.
`id`, `model_id` → car_models, `registration_no` (UNIQUE), document R2 keys + expiries: `rc_doc_key` (no expiry), `insurance_doc_key`+`insurance_expiry` (required), `pollution_doc_key`+`pollution_expiry` (required), `fitness_*`, `permit_*`, `road_tax_*`, `vltd_*` (optional), `extra_docs` (JSON array, added 0003), `active` (1), `created_at`.

**`drivers`** — `id`, `name`, `contact`, `identity_doc_key`, `licence_no`, `licence_doc_key`, `licence_expiry` (rides the same expiry alerts), `active`, `created_at`.

**`users`** — dashboard users **== the partners** used in revenue splits. The login allow-list lives in Cloudflare Access; this table is roster + partner registry.
`id`, `name`, `email` (UNIQUE), `phone`, `photo_key` (R2), `active`, `created_at`.

### Bookings

**`travel_bookings`** — `id`, `display_id` (`'T1'`, `'T2'`… auto via counters, UNIQUE), `start_date`, `end_date`, `pax`, `itinerary`, `addons`, `exclusions` (free text), `customer_name`, `customer_phone`, `booking_amount` (gross charged), `cost_except_car`, `car_cost` (entered transfer price to the car pot, added 0006), `car_included` (1 ⇒ a linked `car_bookings` row with `origin='travel'`), `vendor_name`/`vendor_contact` (referral source, free text; drives commission), `commission`, `comments`, `created_at`, + cancellation cols (`cancelled`, `cancelled_at`, `cancel_reason`, added 0005).
> **FE two-pot breakdown.** `car_cost` (col, added 0006) is an **entered** transfer price (beside `cost_except_car`). When a fleet car is used its pricing is **locked to flat with `flat_fare = car_cost`**. **travel_gross** = `gross − car_cost`; **travel_net** = `gross − cost_except_car − car_cost − commission` → **travel pot**; **car_gross** = `car_cost`; **car_net** = `car_cost − toll − driver_cost` → **car pot**. `car_cost` cancels across the pots, so travel_net + car_net = `gross − cost_except_car − commission − toll − driver`.

**`travel_booking_hotels`** — multi-valued "Hotels Contact" (many rows per travel booking). `id`, `travel_booking_id` (→ travel_bookings, ON DELETE CASCADE), `hotel_name`, `location`, `contact`.

**`car_bookings`** — `id`, `display_id` (`'C1'`… standalone, **or** the parent `'T#'` when `origin='travel'`), `origin` (`'standalone'`|`'travel'`), `travel_booking_id` (set iff origin=travel, CASCADE), `car_id` (→ cars, required), `driver_id` (→ drivers), `start_date`, `end_date`, `duty_type` (`Local`|`Dooars`|`Hills`|`Airport`|`NJP`|`Others`), `route`, `vendor_name`/`vendor_contact`, `commission` (0), `toll` (0, editable at trip end), `driver_cost` (0, editable at trip end), **pricing:** `pricing_type` (`flat`|`distance`), `flat_fare` (when flat), `base_fare`+`per_km_rate` (when distance; rate stored up front), `distance_km` (nullable; often filled at trip end), `remarks`, `created_at`, **cancellation:** `cancelled` (0/1), `cancelled_at`, `cancel_reason` (added 0005 — a cancelled booking is kept but leaves every pool/pending/revenue figure).
Indexes: `travel_booking_id`, `car_id`; **partial** `UNIQUE(display_id) WHERE origin='standalone'` (standalone C# unique; travel-origin rows deliberately reuse the parent T#).
> **FE amount** = `flat_fare`, OR `base_fare + distance_km*per_km_rate` (NULL/**pending** if distance missing).
> **FE net** = `amount − commission − toll − driver_cost`.
> `origin='travel'` rows: amount flows to the **car pool**; they carry **NO payments** (the customer pays the travel booking).

**`payments`** — customer payments, multiple & timestamped. `id`, `travel_booking_id` (CASCADE), `car_booking_id` (CASCADE), `amount`, `received_on` (ISO date), `note`, `created_at`, **`CHECK((travel_booking_id IS NOT NULL) + (car_booking_id IS NOT NULL) = 1)`** — exactly one parent.
> **FE:** `pending = amount − SUM(payments)`; `paid = pending <= 0`.

### Finance

**`expenses`** — `id`, `date` (ISO; month derived), `amount`, `reason` (`Tax`|`Insurance`|`Service`|`VLTD Recharge`|`Oil Refill`|`EMI`|`Miscellaneous`), `category` (`car`|`agency` — reduces the car vs travel pool), `paid_by_user_id` (→ users; always a partner, drives reimbursement), `remarks`, `created_at`.

**`split_config_versions`** — effective-dated split config. `id`, `stream` (`travel`|`car`), `effective_from` (ISO), `note`, `created_at`, `UNIQUE(stream, effective_from)`.
**`split_config_members`** — `version_id` (→ versions, CASCADE), `user_id` (→ users), PK `(version_id, user_id)`.
> A booking resolves to the version **for its stream** whose `effective_from <= booking date` (latest such). **Equal split** among that version's members. **New versions never touch past bookings.**

**`settlements`** — one settled row per `(partner, month)`. Row present ⇒ settled. `id`, `user_id`, `period_month` (`YYYY-MM`), `amount_snapshot` (audit), `breakdown_json` (`{"travel":..,"car":..,"reimbursements":..}`), `settled_at`, `settled_by`, `note`, `UNIQUE(user_id, period_month)`.

### ID issuance

**`counters`** — `name` PK, `value`. Seeded `('travel',0),('car',0)`. Atomic display ids:
```sql
UPDATE counters SET value = value + 1 WHERE name = 'travel' RETURNING value;  -- -> 'T'||value
```
`bookings.js` exposes a `nextId(stream)` helper that does exactly this.

---

## 4. Worker API

`admin.js` is the router. Flow: **bearer guard** → health / makes / car-models → generic CRUD for `cars`/`drivers`/`users` → delegates `travel-bookings`/`car-bookings`/`payments` to `bookings.js`, `expenses`/`split-config`/`settlements` to `finance.js`, and `upload`/`file` to `files.js`.

**Auth guard:** every `/admin/*` request must carry `Authorization: Bearer <ADMIN_DEV_TOKEN>` (env var). Replace with Access JWT verification for prod.

**Generic CRUD** uses a per-entity config object: a **`writable`** allowlist (only these columns accepted on POST/PATCH — **remember to add new columns here**, e.g. `extra_docs` was added to `cars.writable`), a **`required`** list, and a **`listSql`** (the SELECT for GET list, with joins). Example — the cars list joins the model and returns the image:
```js
cars: {
  table: 'cars',
  writable: ['model_id','registration_no','rc_doc_key','insurance_doc_key','insurance_expiry',
    'pollution_doc_key','pollution_expiry','fitness_doc_key','fitness_expiry','permit_doc_key','permit_expiry',
    'road_tax_doc_key','road_tax_expiry','vltd_doc_key','vltd_expiry','extra_docs','active'],
  required: ['registration_no'],
  listSql: `SELECT c.*, m.make, m.model, m.body_type, m.image_url
            FROM cars c LEFT JOIN car_models m ON m.id = c.model_id
            ORDER BY c.active DESC, m.make, m.model`,
}
```

**Soft vs hard delete.** Generic `DELETE /admin/<entity>/:id` **soft-deletes** (`active = 0`). Pass **`?hard=1`** for a permanent delete, which is refused while rows still reference the entity. A resource declares its references via a **`refs`** list on its config:
- A **plain ref** (`{table, col, label}`) blocks on any referencing row → `409 in_use`.
- A **dated ref** (adds `dateExpr`, e.g. `COALESCE(end_date, start_date)`) splits referencing rows by date vs today: **past/undated** rows block outright → `409 historical` (history is never rewritten — deactivate instead); **today/future** rows → `409 reassign_required` with a `bookings:[…]` list so the UI can reassign them to another record first, then retry. `drivers` uses a dated ref on `car_bookings.driver_id`; **R2 doc cleanup on delete is done frontend-side** (same convention as Cars).

**Endpoints (all under `/admin`):**
- `GET  /admin/health`
- `GET  /admin/makes` → `{ makes: [...] }` (DISTINCT make)
- `GET  /admin/car-models?make=<make>` → `{ models: [{id, model, ...}] }`
- `GET|POST /admin/cars`, `PATCH /admin/cars/:id` (generic CRUD)
- `GET|POST /admin/drivers`, `PATCH /admin/drivers/:id`
- `GET|POST /admin/users`, `PATCH /admin/users/:id`
- `…/admin/travel-bookings` (+ nested hotels), `…/admin/car-bookings`, `…/admin/payments` → `bookings.js`
- `…/admin/expenses`, `…/admin/split-config`, `…/admin/settlements` → `finance.js`
- `POST /admin/upload?folder=<folder>&name=<name>` — raw body is the file; returns `{ key }`.
- `GET  /admin/file?key=<key>` — returns the object (auth required).
- `DELETE /admin/file?key=<key>` — `env.DOCS.delete(key)`.

Responses are `{ data: ... }` for lists/entities; errors are `{ error, detail? }` with a non-2xx status (the frontend surfaces `detail || error`).

### R2 object-key conventions
- Car documents: `cars/<registration_no>/<doc>.<ext>` (e.g. `cars/WB73U8875/insurance.pdf`); additional docs `cars/<reg>/x-<slug>-<ts>.<ext>`.
- Car model photos: `car-models/<slug>.webp` (e.g. `car-models/innova.webp`).
- Driver/user documents follow the same `*_doc_key` pattern.

---

## 5. Business logic & flows (all FE-computed)

**Travel booking.** Gross `booking_amount` from the customer. `car_cost` is an **entered** field (beside `cost_except_car`) — the transfer price travel pays its own car pot. When the booking uses a fleet car, the car's pricing is **locked to flat with `flat_fare = car_cost`** (you enter the figure once). Two pots (FE): **travel_net** = `gross − cost_except_car − car_cost − commission` → **travel pot**; **car_net** = `car_cost − toll − driver_cost` → **car pot** (toll/driver from the linked car booking). `car_cost` cancels across the pots, so travel_net + car_net = the owner's real profit (`gross − cost_except_car − commission − toll − driver`). `dashlib.js`'s `travelNet` uses the same `gross − cost_except_car − car_cost − commission`. Hotels are child rows. Payments attach to the travel booking; `pending = booking_amount − Σ payments`.

**Car booking.** `flat` or `distance` pricing. `amount = flat_fare` or `base_fare + distance_km*per_km_rate` (**pending** until `distance_km` is entered at trip end). Net = `amount − commission − toll − driver_cost` (toll, driver_cost, distance are the trip-end editable fields). Standalone car bookings take payments directly.

**Cancellation.** A booking is never deleted; cancelling sets `cancelled=1` (+ `cancelled_at`, and `cancel_reason` — **required in the UI**: the cancel panel blocks with "Please enter cancellation reason" if blank) and it drops out of **every FE figure** — pending, monthly gross/net revenue, action-required items, and upcoming departures (see `dashlib.js`: a `live` filter excludes cancelled rows; they still show in the activity feed badged `Cancelled`). **Restore** flips `cancelled` back to 0. In the UI only standalone car bookings are cancellable; travel-origin rows cancel with their parent travel booking (travel UI pending). The `cancelled`/`cancelled_at`/`cancel_reason` columns are in the `CAR_COLS`/`TRAVEL_COLS` writable lists.

**Internal transfer (travel booking that uses a fleet car).** When a travel booking has `car_included=1`, create a linked `car_bookings` row with `origin='travel'`, `travel_booking_id` set, and `display_id` = the **parent `T#`** (reused on purpose). This row carries **no payments** — the customer pays the travel booking. Revenue routing:
- the **car cost** of that internal trip flows into the **car pool** (3-way), and
- the **travel net** flows into the **travel pool** (4-way).
This keeps the car side of the business compensated for using a fleet vehicle while the agency keeps the travel margin.

**Payments.** Each payment belongs to exactly one booking (DB `CHECK`). Travel-origin car bookings must be **blocked** from taking payments in the UI (guard), since their parent travel booking is where the customer pays.

**Revenue split & settlement.**
- Two streams: **travel** (currently 4-way) and **car** (currently 3-way). Split is **equal** among the members of the version in force.
- Splits are **effective-dated**: a booking uses the version whose `effective_from <= booking date` (latest). Changing a split writes a **new version** from its effective date; **past bookings are untouched**. UI enforces **effective date = today or later** ("Effective date must be today or later — splits can't be backdated."). The current config was backdated to **2026-10-01** via the Worker API (a one-off): travel `[1,2,3,4]`, car `[1,2,4]`.
- **Expenses** reduce the matching pool by `category` (`car` → car pool, `agency` → travel pool) and are **reimbursed** to `paid_by_user_id`.
- **Settlement** is per `(partner, month)`: resolve each booking's split by its date, sum each partner's share of travel + car pools, add their reimbursements, snapshot into `settlements` with a `breakdown_json`. A present row ⇒ settled.

---

## 6. Admin frontend architecture

**Pattern: vanilla-JS-in-React.** React is only the mount point. `App.jsx` renders a static shell via `dangerouslySetInnerHTML` and calls `initApp()` once (guarded against StrictMode double-invoke). Everything else is imperative DOM.

- **`app.js`** exports `SHELL_HTML` (top bar with burger + logo + wordmark + `ADMIN`, scrim, `#tt-side` sidebar, `#tt-main` content) and `initApp()`. It holds the `NAV` config, a `SCREENS` map (`{ dashboard, partners, cars, … }`), client-side routing (`navigate(key)` swaps `#tt-main`), the sidebar builder, and the mobile drawer (`openMenu`/`closeMenu` toggle `.nav-open` on `#dash-root`).
- **Screens** are modules exporting `render<Screen>(main)` that fill the `#tt-main` element and wire their own events. Register a new screen by importing it in `app.js` and adding it to `SCREENS` (the nav key must match). Unregistered nav keys fall back to a "coming soon" placeholder.
- **`api.js`** — `get/post/patch/del(path, body?)` hit `/admin/<path>` with the bearer header and throw an `Error` carrying `.data` (so callers read `e.data.detail || e.data.error`). Plus file helpers: `upload(folder, name, file)` → `{ key }`; `fileUrl(key)`; `fetchBlobUrl(key)` (auth'd fetch → object URL, for `<img>`/preview of **private** R2 files); `deleteFile(key)`.
- **Vite dev proxy:** `/admin` → `VITE_API_BASE` (avoids CORS). Env: `VITE_API_BASE`, `VITE_ADMIN_TOKEN`.

---

## 7. Design system & cosmetic conventions (preserve these)

The whole design is in **`admin/src/index.css`**, **scoped to `#dash-root`**, ported from Akash's own Claude Design dashboard. **Keep all cosmetic work already done — do not regress aesthetics or go back and forth.**

**Tokens** (`:root` of `#dash-root`): warm palette — `--tt-cream #ECE6D7`, `--tt-paper #FBF9F3`, `--tt-ink #2A211C`, `--tt-terra #9D5636`, `--tt-gold #B58A4E`, `--tt-olive #5F7A37`, `--tt-sky #5B6F82`, `--tt-bad #A23B2D`, `--tt-amber #B07420`, plus tints, lines, shadows (`--tt-sh*`), radii. **Fonts:** `Fraunces` (serif, for numbers/headings) + `Hanken Grotesk` (sans). **Icons:** inline SVG in `icons.js`.

**Established UI conventions (reuse, don't reinvent):**
- Full-bleed layout (no side gutters), real logo mark + wordmark in the dark top bar, `ADMIN` pushed right. (The "eastern himalayas" subtitle was removed.)
- Loading overlay uses the copy **"brewing…"** with a spinner.
- **Lists are stacked `.tt-prow` rows, never horizontal scrollers.** On mobile, details flow onto multiple lines rather than scrolling.
- **Mobile nav** = hamburger (`.tt-burger`) → off-canvas drawer + scrim (`.nav-open`), already wired in `app.js`/CSS (<860px).
- Forms: `.tt-fgrid` / `.tt-field` / `.tt-factions`; errors in `.tt-ferr`.
- Status pills: `.tt-badge` + `ok`/`wait`/`due`/`done`.
- Cards `.tt-card` (`min-width:0` so grids don't overflow); section dividers `.tt-group`.
- **Cars documents panel:** three aligned zones per row — **Name · Expiry · File**; round icon buttons (`.tt-dbtn`: upload/eye/trash) pinned right; status chip (None/Uploaded/New·file) sits next to the Expiry field; native "no file selected" clutter hidden. Additional documents have **Delete** only (no redundant Remove); standard slots have **Remove** (clears the file, keeps the slot). Deleting/replacing a file **purges the old R2 object on Save** (see `state.xdel`/`toDelete` in `cars.js`).
- **Car thumbnails:** fixed **height 76px**, **width auto**, `object-fit:contain`, **no border/background** (whole car visible); missing-image fallback is the gold car-silhouette tile (`CAR_GLYPH`), not a bus icon. Private R2 images are loaded via `fetchBlobUrl` + cached.

**Working conventions with the codebase:**
- **Prefer diffs** (search-and-replace snippets) over regenerating whole files; only send a full file for new or massive changes.
- **When replacing CSS, replace the rule in place — do not append.** Appending a second copy of a selector silently overrides the first (we hit this twice: duplicate `.tt-docrow` and `.tt-carthumb` blocks). Keep `index.css` de-duplicated.

---

## 8. Screen specs

### Built
- **Dashboard** (`dashboard.js` + pure `dashlib.js`): fetches ~6 endpoints, runs `computeD(d)` (unit-tested) → KPI "primes", stat tiles, an action center (pending payments / enter-distance tasks with inline actions that `post('payments')` / `patch('car-bookings/:id')`), a monthly-revenue chart (y-max floored to avoid an empty-data infinite loop), an activity feed, and upcoming departures. Loader shows "brewing…". **Nav links wired:** `data-nav` buttons (Add expense → Expenses, New booking / All bookings → Travel) and action-centre "link" buttons (doc-expiry → Cars, licence-expiry → Drivers, no-driver → Car bookings) dispatch a `document` `tt-nav` CustomEvent that `app.js`'s `initApp` listens for and routes via `navigate(key)` (decoupled, no circular import).
- **Partners** (`partners.js`): users CRUD as stacked `.tt-prow` rows; **Revenue splits** (Travel + Car cards with a "Change split" editor — checkboxes of active partners + effective-from date `min=today` + the today-or-later validation message); **Split history** table below.
- **Cars** (`cars.js`): fleet list with expiry pills + model thumbnail; add/edit with **make → model** cascade (`get('makes')` → `get('car-models?make=')`) + registration; **Documents** panel (standard set + labelled additional docs) uploading to R2 and storing expiries; R2 cleanup on delete/replace; model photo on the left of each row.
- **Car bookings** (`carbookings.js`): a container-less **filter bar** on top (`.tt-filters` → one wrapping `.tt-fbar` flex line, directly on the page — no card). Always visible: from/to **date-range** (overlap match), **Status** (active/cancelled/amount-pending), **Duty**, then the **More filters** button. Expanding flows the rest into the same line (wrapping as width allows): **Search** (id/reg/driver/route/vendor), **Car**, **Driver** (incl. "No driver"), **Pricing** (flat/distance), **Type** (standalone/travel-linked). Hidden filters are only rendered when expanded (so toggling does a full `render()`); the More-filters button shows a `(n)` badge when collapsed hidden filters are active. A **Clear** button appears when any filter is set, with a live "N of M bookings" count below. All client-side over the loaded rows; the list re-renders in place (`renderList`) so the search keeps focus while typing (chrome vs rows wiring split: `wireChrome`/`wireRows`). Below it, a stacked `.tt-prow` list of all car bookings (loads `car-bookings` + active `cars` + `drivers`), each a tight row: heading (car + `C#`/`Travel T#` badge), one meta line (`reg · driver · dates`, with route appended only when it differs from the duty type), and a **right-aligned money block** (`.tt-cbamt`) showing the amount — `Pending` in amber when distance pricing has no `distance_km` — with the computed **net** underneath (hidden when it equals the amount). Standalone rows get full **create/edit**; travel-origin rows (origin=`travel`, badged `Travel T#`) are read-mostly — the form locks the fields owned by the travel booking (car, pricing, dates, duty, route, vendor, commission) and exposes only trip-end fields (driver, distance, toll, driver_cost, remarks) and takes no payments. Pricing selector switches **Flat** (`flat_fare`) vs **Distance** (`base_fare` + `per_km_rate`, with `distance_km` as a trip-end field). A live **Amount / Net** preview strip (`.tt-cbsum`) recomputes on input using the same `carAmount`/`carNet` logic as `dashlib.js`. On **create only** (standalone), an optional **Advance** (amount + date) is saved as a `payments` row (`car_booking_id`, note "Advance") right after the booking POST — single source of truth with the Payments screen; travel-origin cars get no advance (the parent travel booking holds the total advance). Edits don't re-show it (further money goes via the Payments screen). **Cancel** (standalone rows) opens an inline confirm panel with a **required** reason (blocks with "Please enter cancellation reason" if blank) → sets `cancelled`/`cancelled_at`/`cancel_reason`; cancelled rows are dimmed (`.tt-row-off`), badged `Cancelled`, show a struck amount + the reason, and offer **Restore** (one-click un-cancel). No hard delete (car bookings have no delete endpoint / `active` column).
- **Drivers** (`drivers.js`): CRUD as stacked `.tt-prow` rows with a **licence-expiry pill** (same `daysUntil` alert logic as car docs). Add/edit form folds in two inline `.tt-docrow` documents — **Identity** (no expiry) and **Licence** (`licence_expiry`) — uploaded to R2 under `drivers/<id>/` (the base row is created first to get the id). Each row has Edit / Deactivate / **Delete**. Delete opens a full-width `.tt-delpanel` under the row: clean → confirm + purge R2 docs; **upcoming** car bookings → lists them + a "reassign all to <driver>" picker that `patch`es each `car-bookings/:id` then retries the hard delete; **past** bookings → blocked (deactivate instead). Backed by the `?hard=1` guard above.
- **Travel bookings** (`travelbookings.js`): loads `travel-bookings` + `car-bookings` + `cars` + `drivers` + `payments`. Filter bar (same `.tt-cbfilters` pattern): always-visible From/To date-range + **Status** (active/paid/pending/cancelled), behind **More filters** a Search (T#/customer/phone/itinerary/vendor) + **Fleet car** (which linked car, or "No fleet car"), with Reset + live count. Each `.tt-prow` row: customer + `T#` badge (+ a `Car <reg>` badge when a fleet car is linked), dates · pax · phone, itinerary, a **paid / `₹ due` pill**, and a right-aligned money block (**gross**, **travel net**, and **car net** when a fleet car is linked). The form preview shows the five-field breakdown — **Gross · Travel gross · Travel net · Car gross · Car net** (`figures()` helper; `car_cost` is an entered field, travel_net = gross − cost_except_car − car_cost − commission → travel pot, car_net = car_cost − toll − driver → car pot). Ticking "uses a fleet car" **locks the car sub-form's pricing to Flat and the flat fare to the entered Car cost** (disabled, kept in sync live; saved as `pricing_type='flat'`, `flat_fare=car_cost`). **Create/edit form**: customer + trip fields; dynamic **Hotels contact** rows (`.tt-hotelrow`, add/remove); money fields; a **"uses a fleet car"** checkbox that reveals a car sub-form (`data-cf` inputs: car/driver/dates/duty/route + flat|distance pricing + toll/driver_cost) — on **create** it nests as `car:{…}` in the POST (backend makes the linked `origin='travel'` row sharing the T#); on **edit** the checkbox is **locked** (car can't be added/removed after creation — `updateTravel` only touches travel cols + hotels) and the car sub-form PATCHes `car-bookings/:linkedId` separately. Live **Gross / Car cost / Net** preview (`.tt-cbsum`). On **create only**, an optional **Total advance** (amount + date) is saved as one `payments` row against the travel booking (note "Advance") after the POST — mirrors the car-booking advance; travel-origin cars never carry an advance (this total covers the package). **Cancel/Restore** (required reason) **cascades** to the linked car booking. Further payments are recorded on the Payments screen.

- **Payments** (`payments.js`): loads `travel-bookings` + `car-bookings` + `payments`. **Record payment** form: Against (Travel / Car) → Booking dropdown (each option tailed with `— ₹X due` / `— paid` / `— amount pending`; excludes cancelled, and car list is standalone-only — travel-origin cars take no payments), Amount, Received on (defaults today), Note. Selecting a booking prefills Amount with its outstanding and shows a pending badge + **"Pay full"**. `POST /admin/payments` with `travel_booking_id` XOR `car_booking_id` (Worker enforces the XOR + travel-origin block). List: each payment as amount + Travel/Car badge, booking ref, date · note, with an inline two-click **Delete** (`DELETE /admin/payments/:id`); live search + "N of M payments" count. `pending = booking amount − Σ payments` (FE; distance car with no km = amount pending, can't be paid against).

- **Expenses** (`expenses.js`): CRUD over `/admin/expenses` + `users` (for the paid-by dropdown). Form: Date (default today), Amount, **Category** — Car (`car` → car pot) / Travel (`agency` → travel pot), the split is on the expense not the line item — optional **Reason** (the 7-value enum), **Paid by** (active partner, drives reimbursement), Remarks. Filter bar (`.tt-cbfilters`): Category, Paid by, Month (`type=month`), Search, Reset + live count, with a **pot-totals line** (`.tt-exsum`: "Car pot −₹X · Travel pot −₹Y") over the filtered set. Rows: amount + Car/Travel badge, date · reason · paid-by, remarks, Edit + inline two-click Delete. The form carries a **double-count guard note** (`.tt-exnote`): record only overhead/operational costs, never a booking's own cost_except_car/commission/toll/driver (already in that booking's net) — see `MONEY_FLOW.md` L-2.

- **Settlements** (`settlements.js` + pure `settlelib.js`): the money model is in **`MONEY_FLOW.md`** — cash-basis, **collection-month** recognition (a booking settles the month it becomes **fully paid**, all-or-nothing), two pots (travel net → travel pot; standalone **and** travel-origin car net → car pot), equal split among the **effective version's** members (resolved by **booking date** = end_date→start_date), **expense** pool-reduction + full **reimbursement**, **rotating** residual, and **cancellation reversal** (−net in `ym(cancelled_at)`). `settlelib.js` `computeSettlement(data, month)` returns pools + per-partner totals + blockers + staleness; it's pure and was reconciled against live data (Σ partner totals ≡ pool nets − expenses + reimbursements, to the rupee). The screen: a **month picker** — a dropdown of every month with activity (labelled "October 2026", newest first) with **◀/▶** arrows, defaulting to the current month and extending **into the future up to the last booking's month** — a **pot-totals** strip (spaced above the table), a **blockers** card (trips ended but not yet recognizable — they'll settle later, nothing lost), a **per-partner table** (travel/car/reimburse/total + Settled / Unsettled / **Needs update** badge — the friendly label for a stale row, with the Δ on hover), and **Settle / Re-settle / Un-settle month** (behind an inline confirm, atomic over all partners; each row `POST /admin/settlements` with `breakdown_json`, un-settle `DELETE`s them). "Needs update" = a settled month whose live recompute ≠ snapshot (after an edit/refund/cancel).

---

## 9. Deployment & ops

All Wrangler commands run from `worker/` (so `wrangler.toml` is picked up); `wrangler` isn't global — use **`npx wrangler`**.

```bash
# apply a migration (remote D1)
cd worker && npx wrangler d1 execute trippin-admin --remote --file migrations/0004_car_image.sql
# ad-hoc query
npx wrangler d1 execute trippin-admin --remote --command "SELECT ..."
# deploy the worker
npx wrangler deploy
# upload a file straight to R2
npx wrangler r2 object put trippin-docs/car-models/innova.webp --file ../admin/public/innova.webp --content-type image/webp --remote
```

**Gotchas / learnings**
- **R2 must be enabled** in the Cloudflare dashboard (needs a payment method on file even for the free tier) — error `10042` otherwise.
- `wrangler d1 execute` can throw **7403 "account not authorized"** even with a valid token; a deployed-Worker API call (curl) is a reliable fallback for data fixes (that's how the Oct-1 split backdate was done).
- Private email / auto-managed DNS records (MX/SRV/autodiscover) don't show in some registrar UIs — verify via DoH if migrating DNS again.
- Dashboard chart math must floor the y-max (`Math.max(1, …)` / `Math.max(5, …)`) or an all-zero month makes the gridline loop spin forever.
- When adding a DB column, also add it to the entity's **`writable`** allowlist and (if it must come back) the **`listSql`** SELECT, then redeploy — otherwise writes are silently dropped / reads omit it.

---

## 10. TODO checklist
- [x] Drivers screen (CRUD + identity/licence docs + licence-expiry alerts + guarded hard-delete/reassign).
- [x] Car bookings screen (standalone + travel-origin, flat/distance pricing, FE amount/net, live preview).
- [x] Travel bookings screen (customer + hotels + money + optional fleet car, FE net, cancel cascade to linked car).
- [x] Payments screen (record against travel/car booking, pending/paid, XOR + travel-origin block, delete).
- [x] Expenses screen (car/travel category → respective pot, paid-by partner, filters + pot totals).
- [x] Settlements screen (cash-basis engine in `settlelib.js`, per month/partner, settle/re-settle/un-settle). **All 9 admin screens built.**
- [x] Wire Dashboard link actions to their screens (`tt-nav` CustomEvent → `navigate`).
- [ ] Set up Cloudflare Access (email OTP) for `admin.*`; verify Access JWT in `admin.js`; remove the dev-token guard.
- [ ] Seed real partners/users and the real fleet.
- [ ] Commit the untracked `worker/migrations/*` (and any admin/ files) and push.
