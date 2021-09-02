/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {PlaywrightTestConfig} from '@playwright/test';
const config: PlaywrightTestConfig = {
  testDir: 'tests',
  use: {
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:8080/',
  },
};
export default config;
