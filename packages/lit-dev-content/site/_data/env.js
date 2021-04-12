/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Allow templates to access environment settings, e.g. if we are building in
// dev mode or not with `{% if env.DEV %}`.
//
// https://www.11ty.dev/docs/data-js/#example-exposing-environment-variables
 module.exports = {
   DEV: process.env.ELEVENTY_ENV === 'dev',
   PLAYGROUND_SANDBOX: process.env.PLAYGROUND_SANDBOX,
 }
