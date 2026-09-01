/**
 * @license
 * Copyright The Lit Project
 * SPDX-License-Identifier: Apache-2.0
 */

let storedMode: string | null = null;
try {
  storedMode = sessionStorage.getItem('color-mode');
} catch {
  // The system color scheme remains the fallback when storage is blocked.
}

if (storedMode === 'light' || storedMode === 'dark') {
  document.body.classList.remove('light', 'dark', 'auto');
  document.body.classList.add(storedMode);

  const meta = document.head.querySelector(
    'meta[name="theme-color"]:not([media])'
  );
  meta?.setAttribute('content', storedMode === 'light' ? '#fff' : '#121212');

  for (const switcher of document.querySelectorAll('theme-switcher')) {
    switcher.setAttribute('mode', storedMode);
    switcher.shadowRoot
      ?.querySelector('litdev-ripple-icon-button')
      ?.shadowRoot?.querySelector('button')
      ?.setAttribute('aria-pressed', String(storedMode === 'dark'));
  }
}
