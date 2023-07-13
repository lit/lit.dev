/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs/promises');
const pathlib = require('path');

const apiDataDir = pathlib.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'lit-dev-api',
  'api-data'
);

const subdirs = ['lit-3', 'lit-2', 'lit-element-2', 'lit-html-1'];

module.exports = async () => {
  const data = {};
  await Promise.all(
    subdirs.map(async (subdir) => {
      data[subdir] = JSON.parse(
        // Don't use require() because of Node caching in watch mode.
        await fs.readFile(
          pathlib.join(apiDataDir, subdir, 'pages.json'),
          'utf8'
        )
      );
    })
  );
  return data;
};
