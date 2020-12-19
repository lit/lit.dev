import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-drawer';

/**
 * Open the LHS drawer when the hamburger icon is clicked.
 */
const enableDrawerMenuButton = () => {
  const button = document.querySelector('.menu-button');
  const drawer = document.querySelector('mwc-drawer');
  button.addEventListener('click', () => {
    drawer.open = !drawer.open;
  });
};

window.addEventListener('DOMContentLoaded', enableDrawerMenuButton);
