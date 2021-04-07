/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Allow templates to check if we are building in dev mode or not
// through the `dev` global (e.g. `{% if dev %} ...`)
//
// https://www.11ty.dev/docs/data-js/#example-exposing-environment-variables
 module.exports = process.env.ELEVENTY_ENV === 'dev';
