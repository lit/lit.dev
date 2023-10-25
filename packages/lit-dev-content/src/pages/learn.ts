import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';

import type {MdChipSet} from '@material/web/chips/chip-set.js';
import {FilterChip} from '@material/web/chips/internal/filter-chip.js';

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

  for (const card of Array.from(
    document.querySelectorAll<HTMLDivElement>('.card-grid > .card')
  )) {
    const cardKind = card.dataset['contentKind'] ?? 'always-show';
    card.style.display =
      keepKinds.has(cardKind) || cardKind === 'always-show' ? 'flex' : 'none';
  }
});
