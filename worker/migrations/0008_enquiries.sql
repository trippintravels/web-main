-- Enquiries captured from the public site's enquiry form (the notifier Worker).
-- The email flow is UNCHANGED: every valid submission is still emailed via Resend.
-- This table is an additional, guaranteed persistence step so no enquiry is lost
-- and the admin dashboard can list them. Only submissions that pass the Worker's
-- gauntlet (origin + rate limit + Turnstile + required fields) are stored here;
-- blocked/bot attempts are rejected before this point and never written.

CREATE TABLE enquiries (
  id          INTEGER PRIMARY KEY,
  display_id  TEXT NOT NULL UNIQUE,            -- 'E1', 'E2', ... (auto, via counters 'enquiry')
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),

  -- what the visitor submitted (mirrors the notifier's normalise(); each <= 2000 chars)
  name        TEXT NOT NULL,                   -- required by the Worker
  phone       TEXT,                            -- "+91 9876543210" (dial + digits); phone OR email is present
  email       TEXT,
  intent      TEXT,                            -- label: 'a specific destination' | 'bike or car rental' | 'corporate & group trips'
  destination TEXT,                            -- the "where" label (a region name, or 'undecided') — 'where' is a reserved word
  message     TEXT,

  -- server-side context captured by the Worker at submit time
  source_url  TEXT,                            -- page/CTA the form was on (Referer header)
  country     TEXT,                            -- Cloudflare geo (request.cf.country)
  ip          TEXT,                            -- CF-Connecting-IP (personal data)
  user_agent  TEXT,                            -- User-Agent header

  -- delivery + admin workflow
  email_sent  INTEGER NOT NULL DEFAULT 0,      -- 1 once the Resend email went out for this enquiry
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','contacted','converted','closed','spam')),
  note        TEXT                             -- free-text follow-up note (admin-entered)
);

CREATE INDEX idx_enquiries_created ON enquiries(created_at);
CREATE INDEX idx_enquiries_status  ON enquiries(status);

-- id issuance for the 'E#' series (mirrors 'travel' -> 'T#', 'car' -> 'C#')
INSERT INTO counters(name, value) VALUES ('enquiry', 0);
