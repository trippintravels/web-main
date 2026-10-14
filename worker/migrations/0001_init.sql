-- Trippin Travels — admin DB schema (Cloudflare D1 / SQLite)
-- Convention: money = INTEGER rupees (no floats); dates = TEXT ISO 'YYYY-MM-DD';
-- timestamps = TEXT ISO via datetime('now'); booleans = INTEGER 0/1;
-- document columns ending _key hold a Cloudflare R2 object key.
-- All derived values (net, pending, paid, status colours, expiry alerts,
-- monthly revenue, settlement figures) are computed on the FRONTEND from the
-- raw inputs stored here — the DB stores inputs only.

PRAGMA foreign_keys = ON;

-- ============================================================= reference & people

-- Catalogue of make/model (seed = cars_india.json). Reference data.
-- Front end: make dropdown (SELECT DISTINCT make) -> filters model dropdown.
CREATE TABLE car_models (
  id         INTEGER PRIMARY KEY,          -- keep the JSON ids
  make       TEXT NOT NULL,
  model      TEXT NOT NULL,
  body_type  TEXT,
  fuel_types TEXT,                         -- JSON array, e.g. ["Petrol","CNG"]
  status     TEXT DEFAULT 'on_sale',
  UNIQUE (make, model)
);
CREATE INDEX idx_car_models_make ON car_models(make);

-- The fleet — actual owned cars. Bookings reference ONLY these.
CREATE TABLE cars (
  id                INTEGER PRIMARY KEY,
  model_id          INTEGER REFERENCES car_models(id),
  registration_no   TEXT NOT NULL UNIQUE,         -- unique key per car
  -- documents (R2 keys) and expiries
  rc_doc_key        TEXT,                          -- RC: document only, no expiry
  insurance_doc_key TEXT,  insurance_expiry TEXT,  -- required
  pollution_doc_key TEXT,  pollution_expiry TEXT,  -- required
  fitness_doc_key   TEXT,  fitness_expiry   TEXT,  -- optional
  permit_doc_key    TEXT,  permit_expiry    TEXT,  -- optional
  road_tax_doc_key  TEXT,  road_tax_expiry  TEXT,  -- optional
  vltd_doc_key      TEXT,  vltd_expiry      TEXT,  -- optional
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE drivers (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL,
  contact          TEXT,
  identity_doc_key TEXT,                    -- identity document (R2)
  licence_no       TEXT,                    -- optional
  licence_doc_key  TEXT,                    -- optional
  licence_expiry   TEXT,                    -- optional (rides the same alerts)
  active           INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Dashboard users == the partners used in revenue splits.
-- Login allow-list lives in Cloudflare Access; this table is roster + partner registry.
CREATE TABLE users (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  phone      TEXT,
  photo_key  TEXT,                          -- R2
  active     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================= bookings

CREATE TABLE travel_bookings (
  id              INTEGER PRIMARY KEY,
  display_id      TEXT NOT NULL UNIQUE,     -- 'T1', 'T2', ... (auto, via counters)
  start_date      TEXT,
  end_date        TEXT,
  pax             INTEGER,
  itinerary       TEXT,                     -- free text
  addons          TEXT,                     -- free text
  exclusions      TEXT,                     -- free text
  customer_name   TEXT,
  customer_phone  TEXT,
  booking_amount  INTEGER,                  -- gross charged to customer
  cost_except_car INTEGER,                  -- "Cost (except car)"
  car_included    INTEGER NOT NULL DEFAULT 0, -- 1 => a linked car_bookings row (origin='travel')
  vendor_name     TEXT,                     -- referral source (free text); drives commission
  vendor_contact  TEXT,
  commission      INTEGER,                  -- to the vendor, if any
  comments        TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
-- FE net = booking_amount - cost_except_car - (linked car booking amount, if car_included) - commission

-- Hotels Contact is multi-valued: many rows per travel booking.
CREATE TABLE travel_booking_hotels (
  id                INTEGER PRIMARY KEY,
  travel_booking_id INTEGER NOT NULL REFERENCES travel_bookings(id) ON DELETE CASCADE,
  hotel_name        TEXT,
  location          TEXT,
  contact           TEXT
);
CREATE INDEX idx_hotels_booking ON travel_booking_hotels(travel_booking_id);

CREATE TABLE car_bookings (
  id                INTEGER PRIMARY KEY,
  display_id        TEXT NOT NULL,          -- 'C1'...(standalone) OR parent 'T#' when origin='travel'
  origin            TEXT NOT NULL DEFAULT 'standalone'
                      CHECK (origin IN ('standalone','travel')),
  travel_booking_id INTEGER REFERENCES travel_bookings(id) ON DELETE CASCADE, -- set iff origin='travel'
  car_id            INTEGER NOT NULL REFERENCES cars(id),
  driver_id         INTEGER REFERENCES drivers(id),
  start_date        TEXT,
  end_date          TEXT,
  duty_type         TEXT CHECK (duty_type IN ('Local','Dooars','Hills','Airport','NJP','Others')),
  route             TEXT,
  vendor_name       TEXT,                   -- referral source (free text)
  vendor_contact    TEXT,
  commission        INTEGER DEFAULT 0,
  toll              INTEGER DEFAULT 0,      -- editable at trip end
  driver_cost       INTEGER DEFAULT 0,      -- editable at trip end
  -- pricing: flat OR distance-based
  pricing_type      TEXT NOT NULL DEFAULT 'flat' CHECK (pricing_type IN ('flat','distance')),
  flat_fare         INTEGER,                -- when pricing_type='flat'
  base_fare         INTEGER,                -- when 'distance'
  per_km_rate       INTEGER,                -- when 'distance' (stored up front)
  distance_km       INTEGER,                -- nullable; may be filled at trip end
  remarks           TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_carb_travel ON car_bookings(travel_booking_id);
CREATE INDEX idx_carb_car    ON car_bookings(car_id);
-- standalone C# ids are unique; travel-origin rows deliberately reuse the parent T#.
CREATE UNIQUE INDEX idx_carb_display_standalone
  ON car_bookings(display_id) WHERE origin = 'standalone';
-- FE amount = flat_fare, OR base_fare + distance_km*per_km_rate (NULL/pending if distance missing)
-- FE net    = amount - commission - toll - driver_cost
-- origin='travel' rows: amount flows to the CAR pool; they carry NO payments
--   (the customer pays the travel booking).

-- Customer payments: multiple, timestamped. FE: pending = amount - SUM(payments); paid = pending<=0.
CREATE TABLE payments (
  id                INTEGER PRIMARY KEY,
  travel_booking_id INTEGER REFERENCES travel_bookings(id) ON DELETE CASCADE,
  car_booking_id    INTEGER REFERENCES car_bookings(id)    ON DELETE CASCADE,
  amount            INTEGER NOT NULL,
  received_on       TEXT NOT NULL,          -- ISO date
  note              TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK ((travel_booking_id IS NOT NULL) + (car_booking_id IS NOT NULL) = 1) -- exactly one
);
CREATE INDEX idx_pay_travel ON payments(travel_booking_id);
CREATE INDEX idx_pay_car    ON payments(car_booking_id);

-- ============================================================= finance

CREATE TABLE expenses (
  id              INTEGER PRIMARY KEY,
  date            TEXT NOT NULL,            -- ISO; month derived from this
  amount          INTEGER NOT NULL,
  reason          TEXT CHECK (reason IN
                    ('Tax','Insurance','Service','VLTD Recharge','Oil Refill','EMI','Miscellaneous')),
  category        TEXT NOT NULL CHECK (category IN ('car','agency')), -- reduces car vs travel pool
  paid_by_user_id INTEGER NOT NULL REFERENCES users(id),             -- always a partner
  remarks         TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_expenses_date ON expenses(date);

-- Effective-dated split config. A booking resolves to the version for its stream
-- whose effective_from <= booking.start/booking date (latest such). Equal split
-- among that version's members. New versions never touch past bookings.
CREATE TABLE split_config_versions (
  id             INTEGER PRIMARY KEY,
  stream         TEXT NOT NULL CHECK (stream IN ('travel','car')),
  effective_from TEXT NOT NULL,            -- ISO date
  note           TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (stream, effective_from)
);
CREATE TABLE split_config_members (
  version_id INTEGER NOT NULL REFERENCES split_config_versions(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (version_id, user_id)
);

-- One settled row per (partner, month). Row present => settled. Amount snapshotted
-- for audit; breakdown_json keeps the travel/car/reimbursement split shown on the UI.
CREATE TABLE settlements (
  id              INTEGER PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  period_month    TEXT NOT NULL,           -- 'YYYY-MM'
  amount_snapshot INTEGER NOT NULL,
  breakdown_json  TEXT,                    -- {"travel":..,"car":..,"reimbursements":..}
  settled_at      TEXT NOT NULL DEFAULT (datetime('now')),
  settled_by      TEXT,
  note            TEXT,
  UNIQUE (user_id, period_month)
);

-- ============================================================= id issuance
-- Atomic per-series display ids:
--   UPDATE counters SET value = value + 1 WHERE name = 'travel' RETURNING value;  -> 'T'||value
CREATE TABLE counters (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
INSERT INTO counters(name, value) VALUES ('travel', 0), ('car', 0);
