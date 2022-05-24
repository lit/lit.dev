/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const hydrateOnIdle = () => {
  import('../components/lazy-svg.js');
  import('../components/litdev-version-selector.js');
};

if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(hydrateOnIdle);
} else {
  // Safari doesn't have idle callback so just wait 200ms
  setTimeout(hydrateOnIdle, 200);
}

const searches = Array.from(document.body.querySelectorAll('litdev-search'));

for (const search of searches) {
  search.addEventListener(
    'focus',
    async () => {
      await import('../components/litdev-search.js');

      search.focus();
    },
    {once: true}
  );
}
