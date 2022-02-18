(async () => {
  if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
    const {hydrateShadowRoots} = await import(
      '@webcomponents/template-shadowroot/template-shadowroot.js'
    );

    hydrateShadowRoots(document.body);

    document.body.removeAttribute('dsd-pending');
  }
})();
