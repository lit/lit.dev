/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

// Allow templates to check if we are building in dev mode or not
// through the `dev` global (e.g. `{% if dev %} ...`)
//
// https://www.11ty.dev/docs/data-js/#example-exposing-environment-variables
 module.exports = process.env.ELEVENTY_ENV === 'dev';
