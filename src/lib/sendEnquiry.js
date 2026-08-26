// Posts an enquiry to the notifier Worker, which relays it to WhatsApp.
//
// ---- Worker contract ----------------------------------------------------
//   POST  <VITE_NOTIFIER_URL>
//   headers:  content-type: application/json
//             x-api-key: <VITE_NOTIFIER_KEY>
//   body:     { name, phone, email, intent, where, message }   // all strings
//   success:  any 2xx. A JSON body is optional — 204/empty is fine.
//   failure:  any non-2xx; a JSON body is surfaced in the console, not to the user.
//   CORS:     must allow the site origin and the x-api-key request header,
//             and answer the preflight OPTIONS.
//
// ---- On the API key -----------------------------------------------------
// VITE_* values are inlined into the client bundle at build time, so this key
// ships in public JavaScript and anyone can read it. It is a bot speed bump,
// not authentication. The Worker has to defend itself: check the Origin header,
// rate-limit per IP, and cap body size. Never put a WhatsApp token or any real
// secret in a VITE_ var — those belong in the Worker's own environment.
// -------------------------------------------------------------------------

const NOTIFIER_URL = import.meta.env.VITE_NOTIFIER_URL;
const API_KEY = import.meta.env.VITE_NOTIFIER_KEY;

// Don't leave the button spinning forever if the Worker never answers.
const TIMEOUT_MS = 12000;

// The Worker isn't built yet, so "not configured" is the normal state for now:
// the form detects it up front and points people at email instead of failing.
export const isNotifierConfigured = () => Boolean(NOTIFIER_URL && API_KEY);

if (import.meta.env.DEV && !isNotifierConfigured()) {
  console.info(
    '[enquiry] VITE_NOTIFIER_URL / VITE_NOTIFIER_KEY are unset — the form will ' +
    'invite people to email instead of submitting. See .env.example.',
  );
}

export async function sendEnquiry(payload) {
  if (!isNotifierConfigured()) {
    throw Object.assign(new Error('Notifier is not configured'), { code: 'unconfigured' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(NOTIFIER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    // AbortError on timeout, TypeError on network/CORS failure
    const code = err.name === 'AbortError' ? 'timeout' : 'network';
    throw Object.assign(new Error(`Enquiry request failed (${code})`), { code, cause: err });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* body may be unreadable */ }
    throw Object.assign(new Error(`Notifier returned ${res.status} ${detail}`), { code: 'http' });
  }

  // A 2xx is the whole signal; the body is optional and may be empty.
  try { return await res.json(); } catch { return null; }
}
