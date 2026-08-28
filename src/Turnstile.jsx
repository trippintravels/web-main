import { useEffect, useRef } from 'react';

// Cloudflare Turnstile — the bot check in front of the enquiry form.
//
// The site key is public by design (it identifies the widget; the secret that
// validates its token lives only in the Worker). When it isn't set the widget
// is skipped entirely and the Worker, which also skips verification when its
// own secret is unset, still accepts the submission — so the form keeps working
// through every stage of the rollout.

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY;
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const isTurnstileConfigured = () => Boolean(SITEKEY);

// One script load shared by every widget on the page.
let loader = null;
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { loader = null; reject(new Error('Turnstile failed to load')); };
      document.head.appendChild(s);
    });
  }
  return loader;
}

/**
 * Renders the widget and hands its token up via `onToken`.
 *
 * Tokens are single-use and time-limited, so `onToken(null)` fires when one
 * expires or errors — the form treats "no token" as not-yet-verified rather
 * than assuming the last one is still good. Bump `resetKey` after a successful
 * submit to get a fresh token for the next one.
 */
export default function Turnstile({ onToken, resetKey = 0 }) {
  const holder = useRef(null);
  const widgetId = useRef(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITEKEY || !holder.current) return;
    let cancelled = false;

    loadScript()
      .then((turnstile) => {
        if (cancelled || !holder.current) return;
        // React StrictMode mounts effects twice in dev; make sure we never
        // render a second widget into a container that already holds one.
        if (holder.current.firstChild) holder.current.innerHTML = '';

        const refresh = () => {
          // A token is single-use and lives about five minutes. Whenever one
          // stops being valid we must ask for another, or the form is left
          // permanently unable to submit with nothing on screen to explain it.
          try {
            if (widgetId.current) turnstile.reset(widgetId.current);
          } catch { /* widget not mounted */ }
        };

        widgetId.current = turnstile.render(holder.current, {
          sitekey: SITEKEY,
          theme: 'light',
          action: 'enquiry',
          'refresh-expired': 'auto',
          callback: (token) => cb.current?.(token),
          'expired-callback': () => { cb.current?.(null); refresh(); },
          'timeout-callback': () => { cb.current?.(null); refresh(); },
          'error-callback': (code) => {
            // Codes are documented at
            // developers.cloudflare.com/turnstile/troubleshooting/client-side-errors
            //   110200 → this hostname isn't on the widget's allowed list
            //   400020 → sitekey not found (often the secret key pasted by mistake)
            console.error(
              `[turnstile] error ${code ?? '(no code)'} — sitekey ${String(SITEKEY).slice(0, 8)}…, ` +
              `hostname "${window.location.hostname}"`,
            );
            cb.current?.(null);
            // Returning nothing (not true) leaves Cloudflare's own retry and
            // error UI in place — claiming to have handled it stops the widget
            // recovering on its own.
          },
        });
      })
      .catch((err) => {
        console.error('[turnstile]', err.message);
        if (!cancelled) cb.current?.(null);
      });

    return () => {
      cancelled = true;
      try {
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      } catch { /* widget already gone */ }
      widgetId.current = null;
    };
  }, []);

  // Fresh challenge after a successful send.
  useEffect(() => {
    if (!resetKey || !widgetId.current || !window.turnstile) return;
    try {
      window.turnstile.reset(widgetId.current);
      cb.current?.(null);
    } catch { /* nothing rendered yet */ }
  }, [resetKey]);

  if (!SITEKEY) return null;
  return <div className="ts-wrap"><div ref={holder} /></div>;
}
