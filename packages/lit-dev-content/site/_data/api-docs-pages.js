/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs/promises');
const pathlib = require('path');

module.exports = async () =>
  // Don't use require() because of Node caching in watch mode.
  JSON.parse(
    await fs.readFile(
      pathlib.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'lit-dev-api',
        'api-data',
        'lit-2',
        'pages.json'
      ),
      'utf8'
    )
  );
