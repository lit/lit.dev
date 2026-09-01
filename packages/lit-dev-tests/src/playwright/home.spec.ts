/**
 * @license
 * Copyright The Lit Project
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {preventGDPRBanner, waitForTheme} from './util.js';

function runScreenshotTests(dark: boolean) {
  test.describe('Home page screenshots', () => {
    test(`intro section golden${dark ? ' - dark' : ''}`, async ({page}) => {
      await preventGDPRBanner(page);
      await page.goto('/');
      await waitForTheme(page, dark);
      await expect(await page.locator('#intro').screenshot()).toMatchSnapshot(
        `homePageIntroSection${dark ? '-dark' : ''}.png`
      );
    });

    test(`Cookies banner golden${dark ? ' - dark' : ''}`, async ({page}) => {
      await page.goto('/');
      await waitForTheme(page, dark);
      await expect(
        await page.locator('litdev-cookie-banner').screenshot()
      ).toMatchSnapshot(`homePageCookiesBanner${dark ? '-dark' : ''}.png`);
    });
  });
}

test.describe('Home page', () => {
  test('splashLogo accessible.', async ({page}) => {
    await page.goto('/');
    expect(await page.locator('#splashLogo').getAttribute('role')).toBe(
      'heading'
    );
    const homePageImg = page.locator('#splashLogo > svg');
    expect(await homePageImg.getAttribute('aria-label')).toBe('Lit');
  });

  test('mobile navigation button exposes disclosure state', async ({page}) => {
    await preventGDPRBanner(page);
    await page.setViewportSize({width: 500, height: 800});
    await page.goto('/');

    const button = page.locator(
      '#mobileMenuButton button[aria-label="Navigation menu"]'
    );
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'mobileDrawer');

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobileDrawer')).toHaveAttribute('open', '');
    await expect(
      page.locator('#mobileDrawer aside.mdc-drawer--modal')
    ).toHaveClass(/mdc-drawer--open/);

    await page.locator('#mobileDrawer').evaluate((drawer) => {
      (drawer as HTMLElement & {open: boolean}).open = false;
      drawer.dispatchEvent(new Event('MDCDrawer:closed'));
    });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('server-rendered theme icon follows the system', async ({browser}) => {
    const context = await browser.newContext({
      colorScheme: 'dark',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/');

    const switcher = page.locator('#desktopNav theme-switcher');
    await expect(switcher.locator('.mode-icon')).toHaveCount(2);
    await expect(switcher.locator('.light-mode')).toBeHidden();
    await expect(switcher.locator('.dark-mode')).toBeVisible();

    await context.close();
  });

  test('stored theme icon is applied before hydration', async ({page}) => {
    await page.emulateMedia({colorScheme: 'light'});
    await page.addInitScript(() => {
      sessionStorage.setItem('color-mode', 'dark');
    });
    await page.route('**/js/theme-switcher.js', (route) => route.abort());
    await page.goto('/');

    const switcher = page.locator('#desktopNav theme-switcher');
    await expect(switcher).toHaveAttribute('mode', 'dark');
    await expect(switcher.locator('.light-mode')).toBeHidden();
    await expect(switcher.locator('.dark-mode')).toBeVisible();
    await expect(
      switcher.locator('button[aria-label="Dark mode"]')
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('theme follows the system and syncs across tabs', async ({
    context,
    page,
  }) => {
    await page.emulateMedia({colorScheme: 'dark'});
    await page.goto('/');

    const firstBody = page.locator('body');
    const firstToggle = page.locator(
      '#desktopNav theme-switcher button[aria-label="Dark mode"]'
    );

    await expect(firstBody).toHaveClass(/\bdark\b/);
    await expect(firstToggle).toHaveAttribute('type', 'button');
    await expect(firstToggle).toHaveAttribute('aria-pressed', 'true');
    expect(await firstToggle.getAttribute('aria-expanded')).toBe(null);
    expect(await firstToggle.getAttribute('aria-haspopup')).toBe(null);

    await firstToggle.press('Space');
    await expect(firstBody).toHaveClass(/\blight\b/);
    await expect(firstToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(firstToggle).toHaveAttribute('aria-label', 'Dark mode');
    expect(
      await page.evaluate(() => sessionStorage.getItem('color-mode'))
    ).toBe('light');

    await page.goto('/docs/');
    await expect(firstBody).toHaveClass(/\blight\b/);
    await expect(firstToggle).toHaveAttribute('aria-pressed', 'false');
    expect(
      await page.evaluate(() => sessionStorage.getItem('color-mode'))
    ).toBe('light');

    const secondPage = await context.newPage();
    await secondPage.emulateMedia({colorScheme: 'dark'});
    await secondPage.goto('/');

    const secondBody = secondPage.locator('body');
    const secondToggle = secondPage.locator(
      '#desktopNav theme-switcher button[aria-label="Dark mode"]'
    );

    await expect(secondBody).toHaveClass(/\blight\b/);
    await expect(secondToggle).toHaveAttribute('aria-pressed', 'false');

    await secondPage.evaluate(() => {
      const testWindow = window as typeof window & {
        themeMediaChangeCount: number;
        themeMediaQuery: MediaQueryList;
      };
      testWindow.themeMediaChangeCount = 0;
      testWindow.themeMediaQuery = matchMedia('(prefers-color-scheme: dark)');
      testWindow.themeMediaQuery.addEventListener('change', () => {
        testWindow.themeMediaChangeCount++;
      });
    });
    const waitForMediaChangeCount = async (expected: number) => {
      let actual = 0;
      for (let attempt = 0; attempt < 50; attempt++) {
        actual = await secondPage.evaluate(
          () =>
            (
              window as typeof window & {
                themeMediaChangeCount?: number;
              }
            ).themeMediaChangeCount ?? 0
        );
        if (actual === expected) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      expect(actual).toBe(expected);
    };
    await secondPage.emulateMedia({colorScheme: 'light'});
    await waitForMediaChangeCount(1);
    await secondPage.emulateMedia({colorScheme: 'dark'});
    await waitForMediaChangeCount(2);
    await expect(firstBody).toHaveClass(/\bdark\b/);
    await expect(secondBody).toHaveClass(/\bdark\b/);
    expect(
      await secondPage.evaluate(() => sessionStorage.getItem('color-mode'))
    ).toBe(null);

    await secondToggle.click();
    await expect(firstBody).toHaveClass(/\blight\b/);
    await expect(secondBody).toHaveClass(/\blight\b/);

    await secondPage.close();
    await page.close();

    const resetPage = await context.newPage();
    await resetPage.emulateMedia({colorScheme: 'dark'});
    await resetPage.goto('/');
    await expect(resetPage.locator('body')).toHaveClass(/\bdark\b/);
    expect(
      await resetPage.evaluate(() => sessionStorage.getItem('color-mode'))
    ).toBe(null);
    await expect(
      resetPage.locator(
        '#desktopNav theme-switcher button[aria-label="Dark mode"]'
      )
    ).toHaveAttribute('aria-pressed', 'true');
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
});

runScreenshotTests(false);
runScreenshotTests(true);
