/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';

test.describe('Home page', () => {
  test('splashLogo accessible.', async ({page}) => {
    await page.goto('/');
    expect(await page.locator('#splashLogo').getAttribute('role')).toBe(
      'heading'
    );
    const homePageImg = page.locator('#splashLogo > img');
    expect(await homePageImg.getAttribute('aria-label')).toBe('Lit');
  });

  test('search site input basic functionality works', async ({page}) => {
    await page.goto('/');
    const searchInput = page.locator('#desktopNav litdev-search input');
    await searchInput.type('reactive update cycle');

    // Playwright pierces shadow dom by default.
    await page.waitForSelector('litdev-search-option:nth-child(1)', {
      timeout: 1000,
    });

    await expect(
      page.locator('litdev-search-option:nth-child(1) .title')
    ).toHaveText('Lifecycle');
    await expect(
      page.locator('litdev-search-option:nth-child(1) .header')
    ).toHaveText('Reactive update cycle');

    await page.click('litdev-search-option:nth-child(1)');

    await expect(page.locator('#reactive-update-cycle')).toBeVisible();
    expect(page.url().includes('/docs/components/lifecycle')).toBe(true);
  });

  test('intro section golden', async ({page}) => {
    await page.goto('/');
    await expect(await page.locator('#intro').screenshot()).toMatchSnapshot(
      'homePageIntroSection.png'
    );
  });
});
