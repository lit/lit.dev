/**
 * @license
 * Copyright The Lit Project
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {
  preventGDPRBanner,
  waitForPlaygroundPreviewToLoad,
  waitForTheme,
} from './util.js';

test('tutorial navigation uses correctly named native controls', async ({
  page,
}) => {
  await preventGDPRBanner(page);
  await page.goto('/tutorials/intro-to-lit');

  const catalogLink = page.locator(
    'litdev-tutorial litdev-ripple-icon-button a[aria-label="Tutorial Catalog"]'
  );
  await expect(catalogLink).toHaveAttribute('href', '/tutorials/');
  await expect(page.locator('litdev-tutorial a button')).toHaveCount(0);

  const catalogButton = page.locator(
    'litdev-tutorial litdev-ripple-icon-button:has(a[aria-label="Tutorial Catalog"])'
  );
  await catalogButton.evaluate(
    (button: HTMLElement & {disabled: boolean}) => (button.disabled = true)
  );
  await expect(catalogLink).not.toHaveAttribute('href', /.+/);
  await expect(catalogLink).toHaveAttribute('aria-disabled', 'true');
  await expect(catalogLink).toHaveAttribute('tabindex', '-1');

  await expect(
    page.locator(
      'litdev-tutorial #prevButton button[aria-label="Previous step"]'
    )
  ).toBeDisabled();
  await expect(
    page.locator('litdev-tutorial #nextButton button[aria-label="Next step"]')
  ).toBeEnabled();
});

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
