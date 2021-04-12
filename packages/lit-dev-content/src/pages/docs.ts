const narrowLayoutMatcher = window.matchMedia('(max-width:899px)');
let narrowLayout = narrowLayoutMatcher.matches;
narrowLayoutMatcher.addEventListener('change', (event) => {
  narrowLayout = event.matches;
});

const main = () => {
  scrollActiveSiteNavPageIntoView();
  observeActiveTocSection();
};
window.addEventListener('DOMContentLoaded', main);

/**
 * Note we don't use scrollIntoView() because for some reason it causes the
 * entire window to scroll along with the nav. Possibly a bug with sticky
 * position?
 */
const scrollToCenter = (target: Element, parent: Element) => {
  const parentRect = parent.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (
    targetRect.bottom > parentRect.bottom ||
    targetRect.top < parentRect.top
  ) {
    parent.scroll({
      top: targetRect.top - parentRect.top - parentRect.height / 2,
    });
  }
};

/**
 * On initial load, scroll the link for the current page into view.
 */
const scrollActiveSiteNavPageIntoView = () => {
  // Wait for layout.
  requestAnimationFrame(() => {
    // Note we don't use scrollIntoView() because for some reason it causes the
    // entire window to scroll along with the nav. Possibly a bug with sticky
    // position?
    const nav = document.querySelector('#docsNavWrapper');
    const active = document.querySelector('#docsNav .active');
    if (!nav || !active) {
      return;
    }
    scrollToCenter(active, nav);
  });
};

/**
 * Maintain the active TOC section so that it can be visually highlighted, by
 * observing section headings move in and out of view.
 *
 * TODO(aomarks) Convert to a custom element.
 */
const observeActiveTocSection = () => {
  if (!window.IntersectionObserver) {
    return;
  }
  const article = document.querySelector('article');
  const toc = document.querySelector('#rhsToc');
  const innerToc = document.querySelector('#rhsTocInner');
  if (!article || !toc || !innerToc) {
    return;
  }

  const tocHeadings = new Map();
  for (const link of document.querySelectorAll('#rhsToc [href]')) {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) {
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
        if (!narrowLayout) {
          // If the TOC is especially long, and/or the window is especially
          // short (but still wide enough to have a RHS TOC), then the TOC
          // itself can have a scrollbar. Keep the active section in view as we
          // scroll.

          // Wait for layout.
          requestAnimationFrame(() => {
            scrollToCenter(link, innerToc);
          });
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
};
