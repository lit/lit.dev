/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {preventGDPRBanner, waitForTheme} from './util.js';

function runScreenshotTests(dark: boolean) {
  test.describe(`Learn catalog page${dark ? ' - dark' : ''}`, () => {
    test('smoke test', async ({browser}) => {
      const page = await browser.newPage({
        viewport: {width: 1920, height: 1080},
      });
      // stop animations for fewer flakes
      page.emulateMedia({'reducedMotion': 'reduce'});

      await preventGDPRBanner(page);
      await page.goto('/learn/');
      await waitForTheme(page, dark);
      await expect(await page.screenshot()).toMatchSnapshot(
        `learnCatalog${dark ? '-dark' : ''}.png`
      );
    });
  });
}

runScreenshotTests(false);
runScreenshotTests(true);
