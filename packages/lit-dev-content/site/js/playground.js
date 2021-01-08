window.addEventListener('DOMContentLoaded', () => {
  const ide = document.body.querySelector('playground-ide');
  const saveButton = document.body.querySelector('.save-button');
  const urlInput = document.body.querySelector('.playground-url-input');
  const url = new URL(window.location.href);

  const project = url.searchParams.get('project');
  if (project) {
    const decoded = JSON.parse(atob(project));
    // TODO(aomarks) We really need a second origin now that it is trivial for
    // somebody to share a link that executes arbitrary code.
    ide.files = decoded;
  }

  saveButton.addEventListener('click', () => {
    const project = btoa(JSON.stringify(ide.files));
    url.searchParams.set('project', project);
    window.history.replaceState(null, '', url.toString());
    urlInput.value = url.toString();
    urlInput.classList.remove('hidden');
    urlInput.select();
  });

  urlInput.addEventListener('blur', () => {
    urlInput.classList.add('hidden');
  });
});
