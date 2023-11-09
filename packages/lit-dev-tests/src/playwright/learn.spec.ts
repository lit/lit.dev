/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {preventGDPRBanner} from './util.js';

test.describe('Learn catalog page', () => {
  test('smoke test', async ({browser}) => {
    const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
    await preventGDPRBanner(page);
    await page.goto('/learn/');
    await expect(await page.screenshot()).toMatchSnapshot('learnCatalog.png');
  });
});
