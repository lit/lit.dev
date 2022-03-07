/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {waitForPlaygroundPreviewToLoad} from './util.js';

test.describe('Tutorial page', () => {
  test('intro first step', async ({browser}) => {
    const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
    await page.goto('/tutorial/');
    await waitForPlaygroundPreviewToLoad(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'tutorialFirstStep.png'
    );
  });
});
