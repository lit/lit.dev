/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// This is a small script to orchestrate the client side behavior of the
// lit.dev/learn page.This behavior involves filtering content based on which
// `md-filter-chip`s are selected by the user.
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';

import type {MdChipSet} from '@material/web/chips/chip-set.js';
import {FilterChip} from '@material/web/chips/internal/filter-chip.js';

const intentionallyBlank = document.querySelector<HTMLElement>(
  '#intentionally-blank'
);
if (!intentionallyBlank) {
  throw new Error(`Internal Error: no intentionally blank element.`);
}
intentionallyBlank.style.display = 'none';

/**
 * Show only the necessary content on the learn page by toggling display
 */
const chipSet = document.querySelector<MdChipSet>('#chips');
if (!chipSet) {
  throw new Error(`Internal Error: no filter chips rendered`);
}
chipSet.addEventListener('click', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for filter chips to be completely updated.
  const keepKinds = new Set(
    (chipSet.chips as FilterChip[])
      .filter((el) => el.selected)
      .map((el) => el.dataset['value'])
  );

  intentionallyBlank.style.display = keepKinds.size === 0 ? 'block' : 'none';
  for (const card of Array.from(
    document.querySelectorAll<HTMLDivElement>('.card-grid > .card')
  )) {
    const cardKind = card.dataset['contentKind'] ?? 'always-show';
    card.style.display =
      keepKinds.has(cardKind) || cardKind === 'always-show' ? 'flex' : 'none';
  }
});
