window.addEventListener('load', () => {
  const hamburger = document.querySelector('#nav-hamburger');
  const navItems = document.querySelector('#nav-items');

  const closeMenu = (event) => {
    navItems.classList.add('closed');
    window.removeEventListener('click', closeMenu);

  };

  hamburger.addEventListener('click', (event) => {
    navItems.classList.remove('closed');
    window.addEventListener('click', closeMenu);
    // Don't immediately trigger the closeMenu handler we just added.
    event.stopPropagation();
    // Don't scroll to the top.
    event.preventDefault();
  });
});
