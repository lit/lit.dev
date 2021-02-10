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
 * On initial load, scroll the link for the current page into view.
 */
const scrollActiveSiteNavPageIntoView = () => {
  //const active = document.querySelector('.lhs-nav .active');
  // TODO(aomarks) scrollIntoView when the scrolling parent is sticky, will
  // also scroll the window. scrollIntoViewIfNeeded works fine, though.
  //active?.scrollIntoViewIfNeeded?.();
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
  const toc = document.querySelector('.rhs-toc');
  if (!toc) {
    return;
  }
  const article = document.querySelector('article');
  if (!article) {
    return;
  }

  const tocHeadings = new Map<string, Element>();
  for (const link of document.querySelectorAll('.rhs-toc [href]')) {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) {
      continue;
    }
    const id = href.slice(1);
    tocHeadings.set(id, link);
  }

  const visibleHeadings = new Set<string>();
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
        if (!narrowLayout && Element.prototype.scrollIntoViewIfNeeded) {
          // If the TOC is especially long, and/or the window is especially
          // short (but still wide enough to have a RHS TOC), then the TOC
          // itself can have a scrollbar. Keep the active section in view as we
          // scroll.
          //
          // TODO(aomarks) scrollIntoView when the scrolling parent is sticky, will
          // also scroll the window. scrollIntoViewIfNeeded works fine, though.
          //link.scrollIntoViewIfNeeded?.();
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
