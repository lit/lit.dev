/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {MODS, addModsParameterToUrlIfNeeded} from '../mods.js';

if (MODS) {
  document.body.classList.add(
    ...MODS.split(' ')
      .map((v) => v.trim())
      .filter((v) => v !== '')
  );
  window.addEventListener('click', (event) => {
    for (const el of event.composedPath()) {
      if (el instanceof HTMLAnchorElement) {
        el.href = addModsParameterToUrlIfNeeded(el.href);
        break;
      }
    }
  });
}
