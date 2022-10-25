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
    const searchButton = page.locator(
      '#desktopNav litdev-search-modal > button'
    );
    const searchInput = page.locator('#desktopNav litdev-search input');

    // hydrate the modal
    searchButton.focus();
    searchButton.click();

    // wait for the modal to open
    await page.waitForSelector('#desktopNav litdev-search-modal dialog[open]');

    // trigger hydration
    searchInput.focus();
    await searchInput.type('reactive update cycle');

    // Playwright pierces shadow dom by default.
    await page.waitForSelector(
      '.group:nth-of-type(1) litdev-search-option:nth-of-type(1)'
    );

    // section title and type should be correct
    await expect(
      page.locator('.group:nth-of-type(1) .descriptor:nth-of-type(1) .title')
    ).toHaveText('Lifecycle');
    await expect(
      page.locator('.group:nth-of-type(1) .descriptor:nth-of-type(1) .tag')
    ).toHaveText('Docs');

    // First Result should be a document title not a subsection
    await expect(
      page.locator(
        '.group:nth-of-type(1) litdev-search-option:nth-of-type(1) .title'
      )
    ).toHaveText('Lifecycle');
    await expect(
      page.locator(
        '.group:nth-of-type(1) litdev-search-option:nth-of-type(1) .text'
      )
    ).toHaveCount(0);

    // Second result should be a subsection
    await expect(
      page.locator(
        '.group:nth-of-type(1) litdev-search-option:nth-of-type(2) .title'
      )
    ).toHaveText('Reactive update cycle');
    await expect(
      page.locator(
        '.group:nth-of-type(1) litdev-search-option:nth-of-type(2) .text'
      )
    ).not.toBeEmpty();

    // click on the subsection
    await page.click(
      '.group:nth-of-type(1) litdev-search-option:nth-of-type(2)'
    );

    await expect(page.locator('#reactive-update-cycle')).toBeVisible();
    expect(page.url().includes('/docs/components/lifecycle')).toBe(true);
  });

  test('intro section golden', async ({page}) => {
    await page.goto('/');
    await expect(await page.locator('#intro').screenshot()).toMatchSnapshot(
      'homePageIntroSection.png'
    );
  });

  test('Cookies banner golden', async ({page}) => {
    await page.goto('/');
    await expect(
      await page.locator('litdev-cookie-banner').screenshot()
    ).toMatchSnapshot('homePageCookiesBanner.png');
  });
});
