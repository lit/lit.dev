/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Note these aren't imported from home.ts, because home.ts is critical inlined
// code, and we want to load these components asynchronously.

// TODO(aomarks) A better solution would be for each page to dynamically import its
// lazy dependencies. Rollup almost does the right thing here, except that the relative
// import paths are wrong when we import. Find a way to fix the relative paths.
import '../components/litdev-code-language-switch.js';
