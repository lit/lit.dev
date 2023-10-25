/**
 * Show only the necessary content on the learn page by toggling display
 */
document.querySelector('#chips')!.addEventListener('click', (e) => {
  const {target} = e;
  if (!(target instanceof HTMLSpanElement)) {
    return;
  }
  const selectedContentType = target.dataset["value"] ?? "all";

  for (const card of Array.from(document.querySelectorAll<HTMLDivElement>('card-grid > card'))) {
    if (selectedContentType === 'all') {
        card.style.display = 'none';
        return;
    }
    const isVisible = card.classList.contains(selectedContentType);
    card.style.display = isVisible ? 'flex' : 'none';
  }
});
