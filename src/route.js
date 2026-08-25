import { useState, useEffect } from 'react';

// Minimal hash-based router — GitHub-Pages-safe (no server rewrites) and
// deep-linkable: #/our-story and #/our-story/our-team.
const STORY_PREFIX = '#/our-story';

export const slugify = (s) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function parseHash() {
  const h = window.location.hash || '';
  if (h === STORY_PREFIX || h.startsWith(STORY_PREFIX + '/') || h.startsWith(STORY_PREFIX + '#')) {
    const rest = h.slice(STORY_PREFIX.length).replace(/^[/#]/, '');
    return { page: 'story', section: rest || null };
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
