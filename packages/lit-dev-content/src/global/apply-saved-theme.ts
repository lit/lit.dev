/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Checks if there has been a theme already set from a prior visit
let lastTheme = localStorage.getItem('color-mode');

// Saves the default color mode theme as auto.
if (!lastTheme) {
  localStorage.setItem('color-mode', 'auto');
  lastTheme = 'auto';
}

// Applies the theme string to the document.
document.body.classList.add(lastTheme);
