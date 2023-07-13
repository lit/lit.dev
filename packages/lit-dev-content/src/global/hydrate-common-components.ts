/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {LitDevSearchModal} from '../components/litdev-search-modal.js';
import {onMediaQueryOnce, onIdle} from '../util/hydration-helpers.js';

if (!localStorage.getItem('gtag-banner-shown')) {
  onIdle(() => {
    import('../components/litdev-cookie-banner.js');
  });
}

// hydrates on desktop and mobile
const hydrateCommonComponents = () => {
  import('../components/lazy-svg.js');
  import('../components/litdev-version-selector.js');
};

// hydrates on mobile
const hydrateMobileNav = () => {
  import('@material/mwc-drawer');
};

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

// hydrate the search modal

// There are 2 modal buttons on the page. In the header and in the mobile nav.
// We need to open the one in the current view or else it'll open a hidden
// modal that makes the dom inert.
const searchModals = document.querySelectorAll(
  'litdev-search-modal'
) as NodeListOf<LitDevSearchModal>;
let modalHydrated = false;

const hydrateSearchModal = async () => {
  if (modalHydrated) return;
  await import('../components/litdev-search-modal.js');
  modalHydrated = true;
};

for (const searchModal of searchModals) {
  searchModal?.addEventListener('focus-within', hydrateSearchModal, {
    once: true,
  });
  searchModal?.addEventListener('pointerenter', hydrateSearchModal, {
    once: true,
  });

  searchModal?.addEventListener(
    'click',
    () => {
      searchModal.open = true;
      hydrateSearchModal();
    },
    {
      once: true,
    }
  );
}

/**
 * This will listen for the CMD or CTRL+K keypress and open the active search
 * modal. If the modal is not hydrated it will hydrate it. This event listener
 * does not get removed because it needs to determine which of the two modals to
 * open based on the current viewport (mobile or desktop).
 */
const hydrateAndOpenOnCMDK = async (e: KeyboardEvent) => {
  if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    const isMobile = window.matchMedia('(max-width: 864px)').matches;
    const navBar = isMobile ? 'mobileSiteNav' : 'desktopNav';

    // We need to make sure we open the currently visible modal or else it'll
    // open a hidden modal that makes the dom inert.
    const searchModal = document.querySelector(
      `#${navBar} litdev-search-modal`
    ) as LitDevSearchModal;
    const drawer = document.body.querySelector('mwc-drawer');

    if (isMobile && drawer) {
      // Drawer needs to be visible for modal to be visible. There is a bug in
      // FF where the modal becomes the width of the drawer on first render.
      drawer.open = true;
    }
    searchModal.open = true;
    await hydrateSearchModal();
  }
};

document.addEventListener('keydown', hydrateAndOpenOnCMDK);

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
