import {test, expect} from '@playwright/test';

const LOCAL_DOMAIN = `http://localhost:8080/`;

test.describe('Home page', () => {
  test('splashLogo accessible.', async ({page}) => {
    await page.goto(LOCAL_DOMAIN);
    expect(await page.locator('#splashLogo').getAttribute('role')).toBe(
      'heading'
    );
    const homePageImg = page.locator('#splashLogo > img');
    expect(await homePageImg.getAttribute('aria-label')).toBe('Lit');
  });

  test('homepage screenshot test', async ({page}) => {
    await page.goto(LOCAL_DOMAIN);
    const homePageIntro = page.locator('#intro');
    expect(await homePageIntro.screenshot()).toMatchSnapshot('home-intro.png');
  });

  test('search site input basic functionality works', async ({page}) => {
    await page.goto(LOCAL_DOMAIN);
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
  });
});
