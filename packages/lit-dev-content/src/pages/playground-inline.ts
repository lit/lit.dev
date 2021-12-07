// To prevent layout shift, don't render main content until we've determined
// whether the drawer is going to be open or closed.
if (!window.location.hash.match(/^#(project|gist)=/)) {
  document.body.querySelector('litdev-drawer')!.setAttribute('open', '');
}
document.body.classList.add('ready');
