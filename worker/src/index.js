/**
 * Trippin' Travels — enquiry notifier.
 *
 * Receives an enquiry from the site's form and relays it. Today that's one
 * channel (email via Resend); the fan-out below is deliberately written for
 * several, so adding WhatsApp later is a push to `channels` rather than a
 * rewrite.
 *
 * Deployed separately from the site:  cd worker && npx wrangler deploy
 *
 * ---- request contract (matches src/lib/sendEnquiry.js) -------------------
 *   POST /
 *   headers: content-type: application/json
 *            x-api-key: <NOTIFIER_KEY>
 *   body:    { name, phone, email, intent, where, message, turnstileToken }
 *   200 { ok: true }            delivered
 *   4xx { error: "<code>" }     rejected — see codes below
 *   502 { error: "send_failed" } every channel failed
 * -------------------------------------------------------------------------
 *
 * The x-api-key is compiled into the site's public JavaScript and is readable
 * by anyone. It only filters idle scrapers. The real gates are the Origin
 * allowlist, the Turnstile token (verified server-side, unforgeable) and the
 * per-IP rate limit.
 */

const WINDOW_SECONDS = 600;   // rate-limit window: 10 minutes
const MAX_PER_WINDOW = 5;     // submissions per IP per window
const MAX_BODY_BYTES = 8192;  // an enquiry is ~1KB; anything larger is noise
const FIELD_MAX = 2000;       // per-field cap after trimming

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const cors = corsHeaders(origin, allowed);

    // Preflight. Must answer before any other check, or the browser never
    // sends the real request and the failure looks like a CORS bug.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, cors);
    }

    // Cheap rejections first, before we touch KV or any upstream.
    if (allowed.length && !allowed.includes(origin)) {
      return json({ error: 'forbidden_origin' }, 403, cors);
    }
    if (env.NOTIFIER_KEY && request.headers.get('x-api-key') !== env.NOTIFIER_KEY) {
      return json({ error: 'forbidden' }, 403, cors);
    }
    if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
      return json({ error: 'too_large' }, 413, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'bad_json' }, 400, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (await isRateLimited(env, ip)) {
      return json({ error: 'rate_limited' }, 429, cors);
    }

    // Turnstile is what actually stops bots. Skipped only when no secret is
    // configured, so the Worker stays testable before the widget is wired up.
    if (env.TURNSTILE_SECRET) {
      const passed = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, ip);
      if (!passed) return json({ error: 'challenge_failed' }, 403, cors);
    }

    const data = normalise(body);
    if (!data.name) return json({ error: 'missing_name' }, 400, cors);
    if (!data.phone && !data.email) return json({ error: 'missing_contact' }, 400, cors);

    // ---- fan-out -------------------------------------------------------
    // Channels are independent: one failing must not suppress the others.
    const channels = [{ name: 'email', run: sendEmail(env, data) }];
    // Later: channels.push({ name: 'whatsapp', run: sendWhatsApp(env, data) });

    const results = await Promise.allSettled(channels.map((c) => c.run));
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[${channels[i].name}] failed:`, r.reason?.message || r.reason);
      }
    });

    const delivered = results.some((r) => r.status === 'fulfilled');
    return delivered
      ? json({ ok: true }, 200, cors)
      : json({ error: 'send_failed' }, 502, cors);
  },
};

/* ---------------- helpers ---------------- */

const parseOrigins = (s) =>
  (s || '').split(',').map((o) => o.trim()).filter(Boolean);

function corsHeaders(origin, allowed) {
  // Echo the caller's origin only when it's on the list — never "*", which
  // would let any site post through this Worker.
  const permit = allowed.length === 0 || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': permit && origin ? origin : (allowed[0] || 'null'),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (obj, status, cors) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });

const str = (v) => (typeof v === 'string' ? v.trim().slice(0, FIELD_MAX) : '');

function normalise(body) {
  return {
    name: str(body.name),
    phone: str(body.phone),
    email: str(body.email),
    intent: str(body.intent),
    where: str(body.where),
    message: str(body.message),
  };
}

async function isRateLimited(env, ip) {
  if (!env.RATE_LIMIT) return false; // no KV bound — fail open, don't block real enquiries
  const key = `rl:${ip}`;
  const now = Date.now();

  let rec = null;
  try {
    rec = await env.RATE_LIMIT.get(key, 'json');
  } catch (err) {
    console.error('KV read failed:', err?.message);
    return false;
  }

  const write = (value, ttl) =>
    env.RATE_LIMIT.put(key, JSON.stringify(value), {
      expirationTtl: Math.max(60, ttl), // KV enforces a 60s minimum
    }).catch((err) => console.error('KV write failed:', err?.message));

  if (!rec || typeof rec.reset !== 'number' || now > rec.reset) {
    await write({ n: 1, reset: now + WINDOW_SECONDS * 1000 }, WINDOW_SECONDS);
    return false;
  }
  if (rec.n >= MAX_PER_WINDOW) return true;

  await write({ n: rec.n + 1, reset: rec.reset }, Math.ceil((rec.reset - now) / 1000));
  return false;
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip && ip !== 'unknown') form.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const out = await res.json();
    if (!out.success) console.warn('Turnstile rejected:', out['error-codes']);
    return out.success === true;
  } catch (err) {
    console.error('Turnstile unreachable:', err?.message);
    return false; // fail closed — an unverifiable request is not trusted
  }
}

/* ---------------- email ---------------- */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function subjectFor(d) {
  const tail = d.where ? ` · ${d.where}` : '';
  return `Enquiry — ${d.name}${tail}`;
}

function textBody(d) {
  const rows = [
    ['Name', d.name],
    ['Phone', d.phone],
    ['Email', d.email],
    ['Planning', d.intent],
    ['Where', d.where],
  ].filter(([, v]) => v);

  let out = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  if (d.message) out += `\n\nMessage:\n${d.message}`;
  return out;
}

function htmlBody(d) {
  const row = (label, value) =>
    value
      ? `<tr>
           <td style="padding:7px 16px 7px 0;color:#8a7b6d;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
           <td style="padding:7px 0;color:#29211c;font-size:15px">${escapeHtml(value)}</td>
         </tr>`
      : '';

  const message = d.message
    ? `<div style="margin-top:22px;padding-top:18px;border-top:1px solid #e2d8c8">
         <div style="color:#8a7b6d;font-size:13px;margin-bottom:6px">Message</div>
         <div style="color:#29211c;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(d.message)}</div>
       </div>`
    : '';

  const replyLine = d.email
    ? `<p style="margin:22px 0 0;color:#8a7b6d;font-size:13px">Reply to this email to answer ${escapeHtml(d.name)} directly.</p>`
    : '';

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f1ebe0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#f6f1e7;border:1px solid #e2d8c8;border-radius:6px;padding:26px">
      <div style="color:#a9674c;font-size:11px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px">New enquiry</div>
      <table style="border-collapse:collapse;width:100%">${
        row('Name', d.name) + row('Phone', d.phone) + row('Email', d.email) +
        row('Planning', d.intent) + row('Where', d.where)
      }</table>
      ${message}
      ${replyLine}
    </div>
  </body></html>`;
}

async function sendEmail(env, d) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');

  const payload = {
    from: env.MAIL_FROM,
    to: [env.MAIL_TO],
    subject: subjectFor(d),
    text: textBody(d),
    html: htmlBody(d),
  };
  // Reply goes to the traveller, not back to ourselves.
  if (d.email) payload.reply_to = d.email;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text().catch(() => '')}`);
  }
  return res.json().catch(() => null);
}
