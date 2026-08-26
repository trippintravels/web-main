import { useState, useEffect } from 'react';

// Minimal hash-based router — GitHub-Pages-safe (no server rewrites) and
// deep-linkable: #/our-story and #/our-story/our-team.
const STORY_PREFIX = '#/our-story';
const DEST_PREFIX = '#/destinations';

export const slugify = (s) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function parseHash() {
  const h = window.location.hash || '';
  if (h === STORY_PREFIX || h.startsWith(STORY_PREFIX + '/') || h.startsWith(STORY_PREFIX + '#')) {
    const rest = h.slice(STORY_PREFIX.length).replace(/^[/#]/, '');
    return { page: 'story', section: rest || null };
  }
  // #/destinations/<region>            → region page (map + zone index)
  // #/destinations/<region>/<zone>     → zone page (intro + sights)
  if (h === DEST_PREFIX || h.startsWith(DEST_PREFIX + '/')) {
    const [region, zone] = h.slice(DEST_PREFIX.length).replace(/^\//, '').split('/').filter(Boolean);
    if (region && zone) return { page: 'zone', region, zone, section: null };
    if (region) return { page: 'region', region, section: null };
  }
  return { page: 'home', section: null };
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

// Navigate by setting the hash. If the target hash is identical, re-emit a
// hashchange so a repeat click (e.g. same section) still re-scrolls.
export function navigate(hash) {
  if (window.location.hash === hash) {
    window.dispatchEvent(new Event('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export const toStory = (slug) => `${STORY_PREFIX}${slug ? '/' + slug : ''}`;

export const toDestination = (region, zone) =>
  `${DEST_PREFIX}/${region}${zone ? '/' + zone : ''}`;
