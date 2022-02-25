import {hydrateShadowRoots} from '@webcomponents/template-shadowroot/template-shadowroot.js';

// Polyfill will short if the browser supports native DSD
hydrateShadowRoots(document.body);
document.body.removeAttribute('dsd-pending');
