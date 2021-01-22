window.addEventListener('DOMContentLoaded', () => {
  const ide = document.body.querySelector('playground-ide');
  const saveButton = document.body.querySelector('.save-button');
  const snackbar = document.body.querySelector('.copy-snackbar');
  const url = new URL(window.location.href);

  // TODO(aomarks) Should we be using # anchor instead of query params? Better
  // for caching? Also a better naming scheme for these params?
  const projectB64 = url.searchParams.get('project');
  const projectName = url.searchParams.get('project-name');
  if (projectB64) {
    const decoded = JSON.parse(atob(projectB64));
    // TODO(aomarks) We really need a second origin now that it is trivial for
    // somebody to share a link that executes arbitrary code.
    // https://github.com/PolymerLabs/lit.dev/issues/26
    ide.files = decoded;
  } else if (projectName?.match(/^[a-zA-Z0-9_\-\/]+$/)) {
    ide.projectSrc = `/samples/${projectName}/project.json`;
  }

  saveButton.addEventListener('click', async () => {
    const project = btoa(JSON.stringify(ide.files));
    url.searchParams.set('project', project);
    url.searchParams.delete('project-name');
    window.history.replaceState(null, '', url.toString());
    await navigator.clipboard.writeText(url.toString());
    snackbar.show();
  });
});
