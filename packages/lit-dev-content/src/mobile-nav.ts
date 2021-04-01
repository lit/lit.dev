window.addEventListener('DOMContentLoaded', async () => {
  // Expand the current section.
  const activeDetails = document.querySelector(
    '#mobileDocsNav > li.activeSection details'
  ) as HTMLDetailsElement | null;
  if (activeDetails === null) {
    return;
  }
  activeDetails.open = true;
  // Wait for the drawer to upgrade and render.
  await customElements.whenDefined('mwc-drawer');
  requestAnimationFrame(() => {
    // Scroll the active section into view. Use block end so that we don't
    // scroll unnecessarily.
    activeDetails.scrollIntoView({block: 'end'});
  });
});
