/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {preventGDPRBanner, setDarkMode, waitForTheme} from './util.js';

function runScreenshotTests(dark: boolean) {
  test.describe(`Learn catalog page${dark ? ' - dark' : ''}`, () => {
    test('smoke test', async ({browser}) => {
      const page = await browser.newPage({
        viewport: {width: 1920, height: 1080},
      });

      await setDarkMode(page, dark);
      await preventGDPRBanner(page);
      await page.goto('/learn/');
      await waitForTheme(page);
      await expect(await page.screenshot()).toMatchSnapshot(
        `learnCatalog.png${dark ? '-dark' : ''}`
      );
    });
  });
}

runScreenshotTests(false);
runScreenshotTests(true);
