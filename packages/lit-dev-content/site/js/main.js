import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-drawer';

// TODO(aomarks) Lazy load this.
import 'code-sample-editor/lib/code-sample.js';

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

window.addEventListener('load', enableDrawerMenuButton);
