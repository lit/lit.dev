/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: 'playwright',
  testMatch: /.spec.js/,
  // Snapshots need to be generated into a directory that is checked into
  // version control. Default `config.testDir` generates snapshots into the
  // built `lib` directory which is ignored.
  snapshotDir: '../src/playwright',
  retries: 3,
  use: {
    screenshot: 'off',
    baseURL: 'http://localhost:6415/',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  // Prevent implicit snapshot creation and tests passing. Create screenshots
  // explicitly with either:
  //  * Github Action: "Artifacts / Download link for updated screenshots" for
  //    committing the snapshot to the repository.
  //  * `npm run test:integration:update-golden-screenshots` for local testing.
  updateSnapshots: 'none',
  workers: process.env.CI ? 1 : 2,
};
export default config;
