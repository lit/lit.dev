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
   PLAYGROUND_SANDBOX: process.env.PLAYGROUND_SANDBOX || 'http://localhost:6416/',
   GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
   GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
   GITHUB_AUTHORIZE_URL: process.env.GITHUB_AUTHORIZE_URL,
   GITHUB_API_URL: process.env.GITHUB_API_URL,
 }
