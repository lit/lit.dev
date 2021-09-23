/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
  testDir: 'tests',
  use: {
    screenshot: 'off',
    baseURL: 'http://localhost:8080/',
  },
  // To update snapshots please run 'update-goldens' action through Github
  // Actions, and download the results. This keeps snapshots consistent with CI.
  updateSnapshots: 'none',
};
export default config;
