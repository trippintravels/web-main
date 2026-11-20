// session.js — the signed-in admin user, resolved once by app.js (in prod from
// Cloudflare Access → matched partner). Any screen can read it; e.g. Settlements
// stamps `settled_by` with it. In DEV there is no Access identity, so it stays
// null and callers fall back to a sensible default ("Administrator").
let _user = null;  // { id, name, email } | null

export function setCurrentUser(u){ _user = u || null; }
export function getCurrentUser(){ return _user; }

// Label for audit fields (full name preferred, then email), else the fallback.
export function currentUserLabel(fallback){
  return (_user && (_user.name || _user.email)) || fallback || 'Administrator';
}
