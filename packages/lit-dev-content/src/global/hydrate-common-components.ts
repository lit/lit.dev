/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
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
