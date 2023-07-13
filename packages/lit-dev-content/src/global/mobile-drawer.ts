/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// TODO(aomarks) This is pretty hacky. There is currently a loose coupling
// between the mobile menu button and the mobile menu itself (one is defined in
// default.html, the other in header.html). They could be one custom element
// instead.
document.querySelector('#mobileMenuButton')?.addEventListener('click', () => {
  const drawer = document.querySelector('mwc-drawer');
  if (drawer) {
    drawer.open = true;
    drawer.dispatchEvent(new Event('opening'));
  }
});
