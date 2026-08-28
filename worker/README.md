# Enquiry notifier

Cloudflare Worker behind the site's enquiry form. Receives a submission, checks
it, and relays it by email through Resend.

Deployed **separately** from the website — the GitHub Actions workflow that
publishes the site to Pages never touches this directory.

## One-time setup

1. Paste the KV namespace id into `wrangler.toml` (Cloudflare → Storage &
   Databases → KV → your `RATE_LIMIT` namespace).

2. Set the secrets. These never go in a file:

   ```sh
   cd worker
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put NOTIFIER_KEY     # same string as VITE_NOTIFIER_KEY in the site build
   ```

3. Deploy:

   ```sh
   npx wrangler deploy
   ```

## Local development

```sh
npx wrangler dev
```

Local secrets go in `worker/.dev.vars` (gitignored):

```
RESEND_API_KEY=re_...
TURNSTILE_SECRET=0x...
NOTIFIER_KEY=...
```

Omit `TURNSTILE_SECRET` locally and the challenge check is skipped, so you can
post to the Worker with curl without a browser token.

## Checking it works

Put the key in a shell variable — pasting the command with the placeholder
still in it returns `403 {"error":"forbidden"}`, which is the Worker correctly
rejecting a wrong key.

```sh
KEY='the-string-you-gave-wrangler-secret-put'

curl -i https://enquiry-notifier.hey-fdf.workers.dev \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $KEY" \
  -H 'Origin: https://trippintravels.in' \
  -d '{"name":"Test","email":"you@example.com","message":"hello"}'
```

The `Origin` header is required — a request without one is rejected too.

**Once `TURNSTILE_SECRET` is set, curl can no longer pass**: it can't produce a
browser token, so you'll get `403 {"error":"challenge_failed"}`. That's correct
behaviour. Test from the real form instead, or temporarily
`npx wrangler secret delete TURNSTILE_SECRET`, curl, then put it back.

A success is `200 {"ok":true}` and an email at hey@trippintravels.in. Watch
requests live with `npx wrangler tail`.

`npx wrangler secret list` shows which secrets exist but never their values —
if you've lost the key, just set a new one; it only has to match
`VITE_NOTIFIER_KEY` in the site build.

## Response codes

| Code | Meaning |
| --- | --- |
| `200 {ok:true}` | Delivered |
| `forbidden_origin` | `Origin` not in `ALLOWED_ORIGINS` |
| `forbidden` | Wrong or missing `x-api-key` |
| `challenge_failed` | Turnstile token missing or invalid |
| `rate_limited` | More than 5 submissions from one IP in 10 minutes |
| `missing_name` / `missing_contact` | Failed validation |
| `send_failed` | Every channel failed — check `wrangler tail` |

The site shows one calm message for all failures and points people at
`hey@trippintravels.in`; the specific code is for you, in the logs.

## Adding WhatsApp later

`fetch()` builds a `channels` array and runs it through `Promise.allSettled`,
so one channel failing can't suppress another. Adding WhatsApp is a
`sendWhatsApp()` function plus one line in that array — the request contract,
validation and rate limiting all stay as they are.
