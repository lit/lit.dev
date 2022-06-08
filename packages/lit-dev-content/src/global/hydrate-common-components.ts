/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {onMediaQueryOnce, onIdle} from '../util/hydration-helpers.js';

// hydrates on desktop and mobile
const hydrateCommonComponents = () => {
  import('../components/lazy-svg.js');
  import('../components/litdev-version-selector.js');
};

// hydrates on mobile
const hydrateMobileNav = () => {
  import('@material/mwc-drawer');
};

const searches = Array.from(document.body.querySelectorAll('litdev-search'));

// hydrates the litdev-search on focus
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

// When in mobile and in the docs section, opens the <details> element in the
// mobile nav drawer corresponding to the current docs page. Additionally, if
//that section is out of view because the navigation list is too long, scrolls
// it into view.
const activateMobileDetails = async () => {
  // Expand the current section in the mobile nav.
  const activeDetails = document.querySelector(
    '#mobileDocsNav > li.activeSection details'
  ) as HTMLDetailsElement | null;
  if (activeDetails === null) {
    return;
  }
  activeDetails.open = true;

  const drawer = document.body.querySelector('mwc-drawer');
  // Wait for the drawer to begin opening.
  drawer?.addEventListener(
    'opening',
    async () => {
      // await for it to be defined and for it to fully render.
      await customElements.whenDefined('mwc-drawer');
      requestAnimationFrame(() => {
        // Scroll the active section into view. Use block end so that we don't
        // scroll unnecessarily.
        activeDetails.scrollIntoView({block: 'end'});
      });
    },
    {once: true}
  );
};

const onMobileView = () => {
  onIdle(hydrateMobileNav);

  const docsList = document.querySelector('#mobileDocsNav');

  if (!docsList?.children.length) {
    // we are not in the documentation section no need to activate the details
    // for the current docs page nor scroll into view.
    return;
  }

  const activeDetails = document.querySelector(
    '#mobileDocsNav > li.activeSection details'
  );

  if (activeDetails) {
    // may happen on fast mobile load or desktop-to-mobile resize
    activateMobileDetails();
  } else {
    // may happen on first load on mobile
    window.addEventListener('DOMContentLoaded', activateMobileDetails);
  }
};

// Hydrate the components on both mobile and desktop.
onIdle(hydrateCommonComponents);
// Hydrates the components on mobile.
onMediaQueryOnce('(max-width: 864px)', onMobileView);
