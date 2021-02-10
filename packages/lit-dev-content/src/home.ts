window.addEventListener('DOMContentLoaded', () => {
  fadeInLogoOnScroll();
});

const fadeInLogoOnScroll = () => {
  if (!window.IntersectionObserver) {
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.length === 0) {
      return;
    }
    const entry = entries[0];
    document.body.classList.toggle(
      'splash-logo-scrolled',
      !entry.isIntersecting
    );
  });

  // The header logo should fade-in as soon as the splash logo is no longer
  // visible. However, the sticky header occludes the splash logo before it
  // moves out of the viewport.
  //
  // We can't just set rootMargin top to the header height, because that's
  // defined in rems, and only absolute units are allowed in rootMargin. We also
  // can't change the intersection root, because we don't have another scrolling
  // area to use.
  //
  // Instead, we use an invisible .splash-logo-header-offset element, placed
  // var(--header-height) pixels above the bottom of the logo, and check for its
  // intersection with the viewport.
  const splashLogo = document.body.querySelector('.splash-logo-header-offset')!;
  observer.observe(splashLogo);
};
