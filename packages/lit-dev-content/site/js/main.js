import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-drawer';
import './side-nav.js';

// TODO(aomarks) Lazy load this.
import 'code-sample-editor/lib/code-sample.js';

const narrowLayoutMatcher = window.matchMedia('(max-width:899px)');
let narrowLayout = narrowLayoutMatcher.matches;
narrowLayoutMatcher.addEventListener('change', (event) => {
  narrowLayout = event.matches;
});

window.addEventListener('load', () => {
  unhideDrawerAfterUpgrade();
  enableDrawerMenuButton();
  scrollNavIntoView();
  autoExpandAndCollapseToc();
  observeActiveTocSection();
  maintainMaxTocHeightForFooter();

});

/**
 * Avoid jank from the LHS drawer slotted children rendering before the element
 * has upgraded.
 */
const unhideDrawerAfterUpgrade = () => {
  window.customElements?.whenDefined('mwc-drawer').then(() => {
    for (const drawer of document.querySelectorAll('mwc-drawer')) {
      drawer.classList.remove('hidden');
    }
  });
};

/**
 * Trigger the LHS drawer when the hamburger icon is clicked.
 */
const enableDrawerMenuButton = () => {
  const button = document.getElementById('nav-menu-button');
  const drawer = document.getElementById('nav-drawer');
  button.addEventListener('click', () => {
    drawer.open = !drawer.open;
  });
};

/**
 * On initial load, scroll the link for the currently page into view.
 */
const scrollNavIntoView = () => {
  for (const active of document.querySelectorAll('.hierarchical-nav .active')) {
    active.scrollIntoView({block: 'center'});
  }
}

/**
 * Automatically expand or collapse the TOC based on the view.
 */
const autoExpandAndCollapseToc = () => {
  const tocDetails = document.querySelector('.toc details');
  if (!tocDetails) {
    return;
  }
  // Initial load.
  tocDetails.open = !narrowLayout;
  // Resize.
  narrowLayoutMatcher.addEventListener('change', (event) => {
    tocDetails.open = !narrowLayout;
  });
};

let activeTocLink;

/**
 * Maintain the TOC active section (e.g. so that it can be rendered bold) by
 * observing section headings move in and out of view.
 */
const observeActiveTocSection = () => {
  if (!window.IntersectionObserver) {
    return;
  }
  const toc = document.querySelector('.toc');
  if (!toc) {
    return;
  }
  const article = document.querySelector('article');
  if (!article) {
    return;
  }

  const tocHeadings = new Map();
  for (const link of document.querySelectorAll('.toc [href]')) {
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) {
      continue;
    }
    const id = href.slice(1);
    tocHeadings.set(id, link);
  }

  const visibleHeadings = new Set();
  const observer = new IntersectionObserver((entries) => {
    let changed = false;
    for (const entry of entries) {
      const id = entry.target.id;
      if (!id) {
        continue;
      }
      changed = true;
      if (entry.isIntersecting) {
        visibleHeadings.add(id);
      } else {
        visibleHeadings.delete(id);
      }
    }

    if (!changed) {
      // Just being defensive for the case where we accidentally are observing
      // an element that doesn't actually affect the TOC (i.e. it had no id).
      return;
    }

    if (visibleHeadings.size === 0) {
      // If no headers are visible, we're fully immersed in content. Just keep
      // the heading we had before, since it should be the one we're in.
      return;
    }

    let foundFirstVisible = false;
    for (const [id, link] of tocHeadings.entries()) {
      // Note map iteration order preserves insertion order, so we'll always hit
      // the first DOM-order visible heading first.
      if (!foundFirstVisible && visibleHeadings.has(id)) {
        foundFirstVisible = true;
        link.classList.add('active');
        activeTocLink = link;
        if (!narrowLayout) {
          // If the TOC is especially long, and/or the window is especially
          // short (but still wide enough to have a RHS TOC), then the TOC
          // itself can have a scrollbar. Keep the active section in view as we
          // scroll.
          link.scrollIntoView();
        }
      } else {
        link.classList.remove('active');
      }
    }
  });

  // Note that only h2 and h3 headings are included in the table of contents.
  // This is configured in the .eleventy.js config file.
  for (const heading of article.querySelectorAll('h2[id],h3[id]')) {
    observer.observe(heading);
  }
}

/**
 * If the footer is visible, set the max-height of the TOC so that it doesn't
 * overlap with the footer.
 */
const maintainMaxTocHeightForFooter = () => {
  if (!window.IntersectionObserver) {
    return;
  }
  const toc = document.querySelector('.toc');
  if (!toc) {
    return;
  }
  const footer = document.querySelector('footer');
  if (!footer) {
    return;
  }
  const main = document.querySelector('main');
  if (!main) {
    return;
  }

  // Must keep in sync with --header-height CSS variable.
  // TODO(aomarks) Should we measure this once instead?
  const headerHeight = 60;

  let rafId;
  const resizeToc = (event) => {
    if (rafId !== undefined) {
      // Debounce in case more than one scroll event fires per frame.
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      const maxHeight = footer.getBoundingClientRect().top - headerHeight;
      toc.style.maxHeight = `${maxHeight}px`;
      if (!narrowLayout && activeTocLink !== undefined) {
        activeTocLink.scrollIntoView();
      }
      rafId = undefined;
    });
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.length !== 1) {
      return;
    }
    const [entry] = entries;
    if (entry.isIntersecting) {
      main.addEventListener('scroll', resizeToc);
      window.addEventListener('resize', resizeToc);
    } else {
      main.removeEventListener('scroll', resizeToc);
      window.removeEventListener('resize', resizeToc);
      toc.removeAttribute('style');
    }
  });
  observer.observe(footer);
}
