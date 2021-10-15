/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect, Page} from '@playwright/test';
import {
  waitForPlaygroundPreviewToLoad,
  freezeSnackbars,
  readClipboardText,
} from './util';

const signInToGithub = async (page: Page): Promise<void> => {
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('#signInButton'),
  ]);
  await popup.waitForLoadState();
  await popup.click('text=Authorize lit');
  await popup.waitForEvent('close');
};

test.describe('Playground', () => {
  test.beforeEach(async ({browser}) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:6417/reset');
    expect(await page.textContent('body')).toEqual(
      'fake github successfully reset'
    );
    await page.close();
  });

  test('default example is simple-greeting.ts', async ({page}) => {
    await page.goto(`/playground`);

    await waitForPlaygroundPreviewToLoad(page);

    const greetingExample = page.locator(
      '#exampleContent > div:nth-child(1) > ul > li:nth-child(1)'
    );
    await expect(greetingExample).toHaveClass('exampleItem active');

    const codeEditor = page.locator('playground-code-editor #focusContainer');
    expect(
      ((await codeEditor.textContent()) ?? '').includes(
        `@customElement('simple-greeting')`
      )
    ).toBe(true);

    const playgroundPreviewFrame = (await (await page
      .locator('playground-preview iframe')
      .elementHandle())!.contentFrame())!;
    await expect(
      playgroundPreviewFrame.locator('simple-greeting p')!
    ).toHaveText('Hello, World!');
    await expect(playgroundPreviewFrame.locator('simple-greeting p')).toHaveCSS(
      'color',
      'rgb(0, 0, 255)'
    );
  });

  test('updating the example code updates the preview', async ({page}) => {
    await page.goto(`/playground`);

    // Double click text=blue
    await page.dblclick('text=blue');

    // Change the text to red
    await page.keyboard.type('red');

    await waitForPlaygroundPreviewToLoad(page);

    const playgroundPreviewFrame = (await (await page
      .locator('playground-preview iframe')
      .elementHandle())!.contentFrame())!;
    await expect(
      playgroundPreviewFrame.locator('simple-greeting p')
    ).toHaveText('Hello, World!');
    await expect(playgroundPreviewFrame.locator('simple-greeting p')).toHaveCSS(
      'color',
      'rgb(255, 0, 0)'
    );
  });

  test('Hello world project golden', async ({page}) => {
    await page.goto('/playground');
    await waitForPlaygroundPreviewToLoad(page);
    // Because of shadow dom piercing, Playwright finds multiple '#content'
    // nodes, i.e. the page, and within the playground shadow DOM.
    await expect(
      await page.locator('main > #content').screenshot()
    ).toMatchSnapshot('helloWorldPlaygroundProject.png');
  });

  test('share long url', async ({page}) => {
    await page.goto('/playground/?mods=gists');
    await freezeSnackbars(page);

    // Type some new content
    await page.click('playground-code-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('"my long url content";');
    await waitForPlaygroundPreviewToLoad(page);

    // Open the share menu
    await page.click('litdev-playground-share-button');
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareLongUrl-1-shareMenuOpen.png'
    );

    // Save the long URL
    await page.click('litdev-playground-share-long-url copy-button');
    await page.waitForURL(/#project=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'hidden',
    });
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareLongUrl-2-snackbarOpen.png'
    );

    // Reload the page to confirm the new content is still there
    await page.reload();
    await waitForPlaygroundPreviewToLoad(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareLongUrl-3-pageReloaded.png'
    );
  });

  test('share gist', async ({page}) => {
    await page.goto('/playground/?mods=gists');
    await freezeSnackbars(page);

    // Type some new content
    await page.click('playground-code-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('"my gist content";');
    await waitForPlaygroundPreviewToLoad(page);

    // Open the share menu
    await page.click('litdev-playground-share-button');
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-1-shareMenuOpen.png'
    );

    // Sign in to GitHub
    await signInToGithub(page);
    await page.waitForSelector('#saveNewGistButton', {state: 'visible'});
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-2-signedIn.png'
    );

    // Save the gist
    await page.click('#saveNewGistButton');
    await page.waitForURL(/#gist=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'hidden',
    });
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-3-snackbarOpen.png'
    );

    // Reload the page to confirm the new content is still there
    await page.reload();
    await waitForPlaygroundPreviewToLoad(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-4-pageReloaded.png'
    );
  });

  test('share long URL with keyboard shortcuts', async ({page}) => {
    await page.goto('/playground/?mods=gists');

    // On the first Ctrl+S, the share menu opens and we click the copy button
    await page.keyboard.press('Control+S');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });
    await page.click('litdev-playground-share-long-url copy-button');
    await page.waitForURL(/#project=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    const firstUrl = page.url();

    // Change the content
    await page.click('playground-code-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('"new content";');

    // On the next Ctrl+S, the long URL share should happen automatically
    await page.keyboard.press('Control+S');
    await page.waitForURL(
      (url) => url.href.match(/#project=/) !== null && url.href !== firstUrl
    );
    expect(await readClipboardText(page)).toMatch(page.url());
  });

  test('share gist with keyboard shortcuts', async ({page}) => {
    await page.goto('/playground/?mods=gists');

    // On the first Ctrl+S, the share menu opens and we click the new gist button
    await page.keyboard.press('Control+S');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });
    await signInToGithub(page);
    await page.waitForSelector('#saveNewGistButton', {state: 'visible'});
    await page.click('#saveNewGistButton');
    await page.waitForURL(/#gist=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    const firstUrl = page.url();

    // Change the content
    await page.click('playground-code-editor');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('"new content";');

    // On the next Ctrl+S, the new gist should be created automatically
    await page.keyboard.press('Control+S');
    await page.waitForURL(
      (url) => url.href.match(/#gist=/) !== null && url.href !== firstUrl
    );
    expect(await readClipboardText(page)).toMatch(page.url());
  });
});
