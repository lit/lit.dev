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

/**
 * Updates the URL Hash based on the current state of the filter chips. If all
 * chips on the page are selected, then clears the hash.
 */
const updateUrlFromChips = () => {
  const chips = Array.from(chipSet.chips as FilterChip[]);
  let allSelected = true;
  const filters = [];

  for (const chip of chips) {
    if (chip.selected) {
      filters.push(chip.dataset.value!);
    } else {
      allSelected = false;
    }
  }

  // Save it as a query param in the hash to prevent page reload
  const queryParams = new URLSearchParams(window.location.hash.slice(1) ?? '');
  if (allSelected) {
    queryParams.delete('filter');
  } else {
    queryParams.set('filter', filters.join(','));
  }

  window.location.hash = queryParams.toString();
};

const updateContentFromChips = async (updateHash = true) => {
  // Wait for filter chips to be completely updated.
  await new Promise((resolve) => setTimeout(resolve, 0));

  if (updateHash) {
    updateUrlFromChips();
  }

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
};

/**
 * Initialize the filter chips based on the URL hash.
 */
const initChipsFromURL = async (hash = window.location.hash) => {
  const queryParams = new URLSearchParams(hash.slice(1) ?? '');
  const kinds = Array.from(queryParams.get('filter')?.split(',') ?? []);

  chipSet.chips.forEach(async (chip) => {
    // Wait for filter chips to be completely updated to not compete with SSR.
    await chip.updateComplete;
    const chipKind = chip.dataset.value!;
    (chip as FilterChip).selected =
      kinds.length === 0 || kinds.includes(chipKind);
  });

  // Do not update hash to prevent an infinite loop.
  updateContentFromChips(false);
};

// Handle forwards and back navigation between hashes
window.addEventListener('hashchange', async (event: HashChangeEvent) => {
  await initChipsFromURL(new URL(event.newURL).hash);
});

// Handles clicking a filter chip.
chipSet.addEventListener('click', () => updateContentFromChips());

const isChipDefined = !!customElements.get('md-filter-chip');

if (!isChipDefined) {
  // Wait for SSR hydration to complete before initializing the chips.
  customElements.whenDefined('md-filter-chip').then(() => initChipsFromURL());
} else {
  // Hydration has completed, initialize the chips immediately.
  initChipsFromURL();
}
