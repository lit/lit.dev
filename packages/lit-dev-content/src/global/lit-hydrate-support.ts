/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// This file is needed for rollup bundling order despite it never being loaded
// in Production. Loading this file directly in prod in default.html would cause
// an unnecessary second request to lit.js
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
