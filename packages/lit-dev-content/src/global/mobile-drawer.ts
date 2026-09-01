/**
 * @license
 * Copyright The Lit Project
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {Drawer} from '@material/mwc-drawer';
import type {LitDevRippleIconButton} from '../components/litdev-ripple-icon-button.js';

// TODO(aomarks) This is pretty hacky. There is currently a loose coupling
// between the mobile menu button and the mobile menu itself (one is defined in
// default.html, the other in header.html). They could be one custom element
// instead.
const menuButton = document.querySelector(
  '#mobileMenuButton'
) as LitDevRippleIconButton | null;
const drawer = document.querySelector('mwc-drawer') as Drawer | null;

if (menuButton && drawer) {
  const syncExpandedState = () => {
    menuButton.expanded = drawer.open ? 'true' : 'false';
    menuButton.buttonTitle = drawer.open
      ? 'Close navigation menu'
      : 'Open navigation menu';
  };

  menuButton.addEventListener('click', () => {
    drawer.open = true;
    syncExpandedState();
    drawer.dispatchEvent(new Event('opening'));
  });
  drawer.addEventListener('MDCDrawer:opened', syncExpandedState);
  drawer.addEventListener('MDCDrawer:closed', syncExpandedState);
  syncExpandedState();
}
