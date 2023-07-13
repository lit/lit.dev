import {hydrateShadowRoots} from '@webcomponents/template-shadowroot/template-shadowroot.js';

if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode')) {
  hydrateShadowRoots(document.body);
}
document.body.removeAttribute('dsd-pending');
