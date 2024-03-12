/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {
  preventGDPRBanner,
  waitForPlaygroundPreviewToLoad,
  waitForTheme,
} from './util.js';

function runScreenshotTests(dark: boolean) {
  test.describe('Tutorial page', () => {
    test(`intro first step${dark ? ' - dark' : ''}`, async ({browser}) => {
      const page = await browser.newPage({
        viewport: {width: 1920, height: 1080},
      });
      await preventGDPRBanner(page);
      await page.goto('/tutorials/intro-to-lit');
      await waitForPlaygroundPreviewToLoad(page);
      await waitForTheme(page, dark);
      await expect(await page.screenshot()).toMatchSnapshot(
        `introToLitTutorialFirstStep${dark ? '-dark' : ''}.png`
      );
    });
  });
}

runScreenshotTests(false);
runScreenshotTests(true);
