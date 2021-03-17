const mods = new URL(window.location.href).searchParams.get('mods');

if (mods) {
  document.body.classList.add(
    ...mods
      .split(' ')
      .map((v) => v.trim())
      .filter((v) => v !== '')
  );
  window.addEventListener('click', ({target}) => {
    const anchor = (target as HTMLElement).closest('a');
    if (!anchor) {
      return;
    }
    const linkUrl = new URL(anchor.href);
    const thisUrl = new URL(window.location.href);
    if (linkUrl.origin === thisUrl.origin) {
      linkUrl.searchParams.set('mods', mods);
      anchor.href = linkUrl.href;
    }
  });
}
