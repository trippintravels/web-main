import { useState, useEffect } from 'react';
import {
  INTENT_OPTIONS, WHERE_OPTIONS, INTENT_LOC,
  DIAL_CODES, DEFAULT_DIAL, DIAL_LENGTHS,
} from './data.js';
import { sendEnquiry, isNotifierConfigured } from './lib/sendEnquiry.js';
import Turnstile, { isTurnstileConfigured } from './Turnstile.jsx';

const CONTACT_EMAIL = 'hey@trippintravels.in';
const looksLikeEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const digitsOf = (s) => s.replace(/\D/g, '');

// A fixed length where we know it, otherwise the E.164 range — better to accept
// an odd-looking number than to turn away a real traveller on a guess.
function phoneProblem(dial, raw) {
  const n = digitsOf(raw);
  const expected = DIAL_LENGTHS[dial];
  if (expected) {
    if (n.length === expected) return null;
    return `that number should be ${expected} digits after ${dial} — you've entered ${n.length}.`;
  }
  if (n.length < 6 || n.length > 14) return "that phone number doesn't look right — mind checking it?";
  return null;
}

// The enquiry form's fields and submit button — everything below the heading.
//
// Deliberately headless: the drawer and the story page's contact section frame
// it very differently (a slide-out panel vs. a column in a grid), so each call
// site supplies its own heading and surrounding copy and drops this in for the
// part that was previously copy-pasted.

/* underlined select — used for both "what are you planning?" and "where?" */
function SelectField({ placeholder, options, value, onChange, open, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        className="uline"
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: value ? 'var(--bark)' : 'rgba(41,33,28,.4)' }}
      >
        {value ? value.label : placeholder}
        <span style={{ fontSize: 12, color: 'var(--clay)' }}>{open ? '▲' : '▾'}</span>
      </div>
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)',
            background: 'var(--cream)', border: '1px solid rgba(41,33,28,.12)',
            borderRadius: 10, boxShadow: '0 18px 36px -18px rgba(41,33,28,.5)',
            zIndex: 6, overflow: 'hidden', animation: 'fadeIn .18s ease',
          }}
        >
          {options.map((opt, i) => (
            <div
              key={opt.key}
              role="option"
              aria-selected={value?.key === opt.key}
              onClick={() => onChange(opt)}
              style={{
                padding: '15px 18px', font: "400 15px 'Hanken Grotesk', sans-serif",
                textTransform: 'lowercase', color: 'var(--bark)', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : '1px solid rgba(41,33,28,.08)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ece3d3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* compact dial-code picker that shares the phone field's underline */
function DialSelect({ value, onChange, open, onToggle }) {
  return (
    <div style={{ position: 'relative', flex: 'none' }}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="country dialling code"
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
          font: "400 14px 'Hanken Grotesk', sans-serif", color: 'var(--bark)',
          padding: '9px 2px', whiteSpace: 'nowrap',
        }}
      >
        {value}
        <span style={{ fontSize: 11, color: 'var(--clay)' }}>{open ? '▲' : '▾'}</span>
      </div>
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', left: 0, top: 'calc(100% + 6px)',
            width: 208, maxHeight: 232, overflowY: 'auto',
            background: 'var(--cream)', border: '1px solid rgba(41,33,28,.12)',
            borderRadius: 10, boxShadow: '0 18px 36px -18px rgba(41,33,28,.5)',
            zIndex: 7, animation: 'fadeIn .18s ease',
          }}
        >
          {DIAL_CODES.map((d, i) => (
            <div
              key={d.code}
              role="option"
              aria-selected={value === d.code}
              onClick={() => onChange(d.code)}
              style={{
                display: 'flex', justifyContent: 'space-between', gap: 12,
                padding: '11px 14px', font: "400 14px 'Hanken Grotesk', sans-serif",
                color: 'var(--bark)', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : '1px solid rgba(41,33,28,.08)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ece3d3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>{d.country}</span>
              <span style={{ color: 'rgba(41,33,28,.5)' }}>{d.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// The form asks the same questions in the same words everywhere it appears —
// wording, field order and the submit label are fixed here on purpose, not
// exposed as props. The only things a host may vary are the ones its container
// genuinely forces: how the form fills its space, and where it sits.
const GAP = 28;

export default function EnquiryForm({
  // `fill` is the drawer's shape: grow to the panel's height and pin a
  // full-width button to the bottom. Default hugs its content.
  fill = false,
  // set while the form is hidden (e.g. a closed drawer) to fold the dropdown away
  collapse = false,
  // optional: called with the enquiry payload after a successful send
  onSent,
  // optional: { where, message } — seeds the form when it's opened from a
  // context that already knows what the enquiry is about (a zone page's
  // "plan <zone>" CTA). A fresh object each time so re-opening re-applies it.
  prefill,
  style,
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dial, setDial] = useState(DEFAULT_DIAL);
  const [email, setEmail] = useState('');
  const [intent, setIntent] = useState(null);
  const [where, setWhere] = useState(null);
  const [message, setMessage] = useState('');
  // Only one dropdown may be open at a time, so their panels can't overlap.
  const [openField, setOpenField] = useState(null);
  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle');
  // { text, offerEmail } — what to show under the fields, if anything
  const [feedback, setFeedback] = useState(null);
  // Turnstile's proof-of-human, and a counter that forces a fresh one
  const [tsToken, setTsToken] = useState(null);
  const [tsNonce, setTsNonce] = useState(0);

  const askWhere = intent?.key === INTENT_LOC;
  const sending = status === 'sending';

  useEffect(() => {
    if (!collapse) return;
    setOpenField(null);
    // Don't leave a finished result on screen for the next time it's opened —
    // but never interrupt a send that's still in flight.
    setStatus((s) => (s === 'sending' ? s : 'idle'));
    setFeedback(null);
  }, [collapse]);

  // Any edit clears a finished result, so "sent" can't linger over a fresh form.
  const clearResult = () => {
    if (status === 'sent' || status === 'error') {
      setStatus('idle');
      setFeedback(null);
    }
  };
  const edit = (setter) => (e) => { setter(e.target.value); clearResult(); };

  // Seed from the opening context. Intent is always "a specific destination"
  // here — that's what makes the "where?" field appear for the region.
  useEffect(() => {
    if (!prefill) return;
    setIntent(INTENT_OPTIONS.find((o) => o.key === INTENT_LOC) || null);
    const region = WHERE_OPTIONS.find((o) => o.key === prefill.where);
    if (region) setWhere(region);
    if (prefill.message) setMessage(prefill.message);
    setStatus((s) => (s === 'sending' ? s : 'idle'));
    setFeedback(null);
  }, [prefill]);

  const pickIntent = (opt) => {
    setIntent(opt);
    setOpenField(null);
    clearResult();
    // Drop a stale destination if they switch away from "a specific destination".
    if (opt.key !== INTENT_LOC) setWhere(null);
  };

  const toggle = (field) => setOpenField((cur) => (cur === field ? null : field));

  const fail = (text, offerEmail = false) => {
    setStatus('error');
    setFeedback({ text, offerEmail });
  };

  const handleSubmit = async () => {
    if (sending) return;

    // Our own checks rather than the browser's — the form is noValidate so the
    // messaging stays inside the design instead of a default validation bubble.
    if (!name.trim()) return fail('add your name so we know who to reply to.');
    if (!phone.trim() && !email.trim()) return fail('add a phone number or an email so we can reach you.');
    if (email.trim() && !looksLikeEmail(email.trim())) return fail('that email address looks incomplete — mind checking it?');
    if (phone.trim()) {
      const problem = phoneProblem(dial, phone);
      if (problem) return fail(problem);
    }

    // The Worker isn't live yet; say so plainly rather than failing obscurely.
    if (!isNotifierConfigured()) {
      return fail("our enquiry line isn't live just yet — please write to us at", true);
    }
    // Turnstile usually resolves before anyone finishes typing. If it hasn't —
    // most often because the previous token aged out while the form sat open —
    // ask for a fresh challenge rather than leaving the form unable to submit.
    if (isTurnstileConfigured() && !tsToken) {
      setTsNonce((n) => n + 1);
      return fail('just a moment — finishing a quick security check. try again in a second.');
    }

    setStatus('sending');
    setFeedback(null);
    const payload = {
      name: name.trim(),
      phone: phone.trim() ? `${dial} ${digitsOf(phone)}` : '',
      email: email.trim(),
      // send the human-readable labels, not the internal keys
      intent: intent?.label || '',
      where: askWhere ? where?.label || '' : '',
      message: message.trim(),
      turnstileToken: tsToken || '',
    };

    try {
      await sendEnquiry(payload);
      setStatus('sent');
      setFeedback({ text: "thank you — we'll be in touch shortly." });
      onSent?.(payload);
      setName(''); setPhone(''); setEmail(''); setDial(DEFAULT_DIAL);
      setIntent(null); setWhere(null); setMessage('');
      setTsNonce((n) => n + 1); // tokens are single-use — get a fresh one
    } catch (err) {
      console.error('Enquiry failed:', err);
      fail('something went wrong on our end. please try again, or write to us at', true);
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: GAP, flex: fill ? 1 : undefined, ...style }}
    >
      <input className="uline" placeholder="your name" value={name} onChange={edit(setName)} />
      {/* dial code + number share one underline, so they read as one field */}
      <div className="uline-row">
        <DialSelect
          value={dial}
          onChange={(code) => { setDial(code); setOpenField(null); clearResult(); }}
          open={openField === 'dial'}
          onToggle={() => toggle('dial')}
        />
        <input
          className="uline"
          type="tel"
          inputMode="numeric"
          placeholder="phone number"
          value={phone}
          onChange={edit(setPhone)}
        />
      </div>
      <input className="uline" type="email" placeholder="email" value={email} onChange={edit(setEmail)} />

      <SelectField
        placeholder="what are you planning?"
        options={INTENT_OPTIONS}
        value={intent}
        onChange={pickIntent}
        open={openField === 'intent'}
        onToggle={() => toggle('intent')}
      />

      {/* follow-up: which of the four regions (or not decided yet) */}
      {askWhere && (
        <div style={{ animation: 'fadeIn .22s ease' }}>
          <SelectField
            placeholder="where?"
            options={WHERE_OPTIONS}
            value={where}
            onChange={(opt) => { setWhere(opt); setOpenField(null); clearResult(); }}
            open={openField === 'where'}
            onToggle={() => toggle('where')}
          />
        </div>
      )}

      <input className="uline" placeholder="tell us your dream trip" value={message} onChange={edit(setMessage)} />

      <Turnstile onToken={setTsToken} resetKey={tsNonce} />

      {/* Status sits above the button: in the drawer the button is pinned to the
          panel floor, so anything after it would be squeezed against the edge. */}
      {feedback && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            margin: 0,
            font: "400 13px/1.5 'Hanken Grotesk', sans-serif",
            color: status === 'error' ? 'var(--clay)' : 'var(--bark)',
          }}
        >
          {feedback.text}
          {feedback.offerEmail && (
            <>
              {' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--clay)', textDecoration: 'underline' }}>
                {CONTACT_EMAIL}
              </a>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        className="pill"
        disabled={sending}
        style={{
          alignSelf: fill ? 'stretch' : 'flex-start',
          marginTop: fill ? 'auto' : 0,
          font: `500 ${fill ? 14 : 13}px 'Hanken Grotesk', sans-serif`,
          color: 'var(--oat)',
          background: 'var(--clay)',
          padding: fill ? 17 : '15px 30px',
          opacity: sending ? 0.65 : 1,
          cursor: sending ? 'default' : 'pointer',
        }}
      >
        {sending ? 'sending…' : 'send enquiry'}
      </button>
    </form>
  );
}
