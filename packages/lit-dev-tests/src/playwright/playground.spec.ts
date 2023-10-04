/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {
  waitForPlaygroundPreviewToLoad,
  freezeSnackbars,
  freezeDialogs,
  closeSnackbars,
  readClipboardText,
  preventGDPRBanner,
} from './util.js';

import type {Page, Browser} from '@playwright/test';

const isMacOS = process.platform === 'darwin';
const modifierKey = isMacOS ? 'Meta' : 'Control';

const signInToGithub = async (page: Page): Promise<void> => {
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('#signInButton'),
  ]);
  await popup.waitForLoadState();
  await popup.click('text=Authorize lit');
  await popup.waitForEvent('close');
};

const failNextGitHubRequest = async (browser: Browser): Promise<void> => {
  const page = await browser.newPage();
  await preventGDPRBanner(page);
  await page.goto('http://localhost:6417/fail-next-request');
  expect(await page.textContent('body')).toEqual('Next request will fail');
  await page.close();
};

test.describe('Playground', () => {
  test.beforeEach(async ({browser, page}) => {
    const browserPage = await browser.newPage();
    await preventGDPRBanner(page);
    await preventGDPRBanner(browserPage);
    await browserPage.goto('http://localhost:6417/reset');
    expect(await browserPage.textContent('body')).toEqual(
      'fake github successfully reset'
    );
    await browserPage.close();
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

    await waitForPlaygroundPreviewToLoad(page);

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
      await page
        .locator('main > litdev-playground-page > #content')
        .screenshot()
    ).toMatchSnapshot('helloWorldPlaygroundProject.png');
  });

  test('share long url', async ({page}) => {
    await page.goto('/playground/');
    await freezeSnackbars(page);

    // Type some new content
    await page.click('playground-code-editor');
    await page.keyboard.press(`${modifierKey}+A`);
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
    await page.goto('/playground/');
    await waitForPlaygroundPreviewToLoad(page);

    // Type some new content
    await page.click('playground-code-editor');
    await page.keyboard.press(`${modifierKey}+A`);
    await page.keyboard.type('"my gist content";');
    await waitForPlaygroundPreviewToLoad(page);

    // Open the share menu
    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-1-shareMenuOpen.png'
    );

    // Sign in to GitHub
    await signInToGithub(page);
    await page.waitForSelector('#createNewGistButton', {state: 'visible'});
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-2-signedIn.png'
    );

    // Save the gist
    await page.click('#createNewGistButton');
    await page.waitForURL(/#gist=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    const firstUrl = page.url();
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'hidden',
    });
    await freezeSnackbars(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-3-snackbarOpen.png'
    );

    // Reload the page to confirm the new content is still there
    await page.reload();
    await waitForPlaygroundPreviewToLoad(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-4-pageReloaded.png'
    );

    // Type some more content
    await page.click('playground-code-editor');
    await page.keyboard.press(`${modifierKey}+A`);
    await page.keyboard.type('"my updated gist content";');

    // Rename a file
    await page.hover('text=simple-greeting.ts');
    await page.click('text=simple-greeting.ts >> .menu-button');
    await page.click('#renameButton');
    await page.click('.filename-input');
    await page.keyboard.press(`${modifierKey}+A`);
    await page.keyboard.type('new-name.ts');
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-5-renamingFile.png'
    );
    await page.keyboard.press('Enter');

    // Add a new empty file
    await page.click('.add-file-button');
    await page.click('.filename-input');
    await page.keyboard.type('empty.txt');
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-6-addingFile.png'
    );
    await page.keyboard.press('Enter');

    // Open the share menu again
    await waitForPlaygroundPreviewToLoad(page);
    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-7-shareMenuOpenAgain.png'
    );

    // Update the gist
    await freezeSnackbars(page);
    await page.click('#updateGistButton');
    await page.waitForURL(/#gist=/);
    expect(page.url()).toEqual(firstUrl);
    expect(await readClipboardText(page)).toMatch(firstUrl);
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'hidden',
    });
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-8-gistUpdated.png'
    );

    // Reload the page again to confirm the updated content is there
    await page.reload();
    await waitForPlaygroundPreviewToLoad(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'shareGist-9-pageReloadedAgain.png'
    );
  });

  test('share long URL with keyboard shortcuts', async ({page}) => {
    await page.goto('/playground/');
    await waitForPlaygroundPreviewToLoad(page);

    // On the first Ctrl+S, the share menu opens and we click the copy button
    await page.keyboard.press(`${modifierKey}+S`);
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });
    await page.click('litdev-playground-share-long-url copy-button');
    await page.waitForURL(/#project=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    const firstUrl = page.url();

    // Change the content
    await page.click('playground-code-editor');
    await page.keyboard.press(`${modifierKey}+A`);
    await page.keyboard.type('"new content";');
    await waitForPlaygroundPreviewToLoad(page);

    // On the next Ctrl+S, the long URL share should happen automatically
    await page.keyboard.press(`${modifierKey}+S`);
    await page.waitForURL(
      (url) => url.href.match(/#project=/) !== null && url.href !== firstUrl
    );
    expect(await readClipboardText(page)).toMatch(page.url());
  });

  test('share gist with keyboard shortcuts', async ({page}) => {
    await page.goto('/playground/');
    await waitForPlaygroundPreviewToLoad(page);

    // On the first Ctrl+S, the share menu opens and we click the new gist button
    await page.keyboard.press(`${modifierKey}+S`);
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });
    await signInToGithub(page);
    await page.waitForSelector('#createNewGistButton', {state: 'visible'});
    await page.click('#createNewGistButton');
    await page.waitForURL(/#gist=/);
    expect(await readClipboardText(page)).toMatch(page.url());
    const firstUrl = page.url();

    // Change the content
    await page.click('playground-code-editor');
    await page.keyboard.press(`${modifierKey}+A`);
    await page.keyboard.type('"new content";');
    await waitForPlaygroundPreviewToLoad(page);

    // On the next Ctrl+S, the new gist should be updated automatically
    await page.keyboard.press(`${modifierKey}+S`);
    expect(page.url()).toEqual(firstUrl);
    expect(await readClipboardText(page)).toMatch(firstUrl);
  });

  test('user declines github auth', async ({page}) => {
    await page.goto('/playground/');
    await waitForPlaygroundPreviewToLoad(page);

    // Open the share menu
    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout');

    // Click share
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('#signInButton'),
    ]);
    await popup.waitForLoadState();

    // Decline authorization
    await popup.click('text=Cancel');
    await popup.waitForEvent('close');

    // An informative dialog should display
    await page.waitForSelector('[role=alertdialog]');
    await freezeDialogs(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'userDeclinesGithubAuth.png'
    );
  });

  test('user closes github auth window early', async ({page}) => {
    await page.goto('/playground/');
    await waitForPlaygroundPreviewToLoad(page);

    // Open the share menu
    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout');

    // Click share
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('#signInButton'),
    ]);
    await popup.waitForLoadState();

    // Close the window
    await popup.close();

    // An informative dialog should display
    await page.waitForSelector('[role=alertdialog]');
    await freezeDialogs(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'userClosesGitHubAuthWindowTooEarly.png'
    );
  });

  test('gist does not exist', async ({page}) => {
    await page.goto('/playground/#gist=not-a-real-gist');
    await waitForPlaygroundPreviewToLoad(page);

    // An informative dialog should display
    await page.waitForSelector('[role=alertdialog]');
    await freezeDialogs(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'gistDoesNotExist.png'
    );
  });

  test('backend error writing gist', async ({page, browser}) => {
    await page.goto('/playground/');

    // Type some new content
    await page.click('playground-code-editor');
    await page.keyboard.press(`${modifierKey}+A`);
    await page.keyboard.type('"my gist content";');
    await waitForPlaygroundPreviewToLoad(page);

    // Open the share menu
    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout');

    // Sign in to GitHub
    await signInToGithub(page);

    // Try to save the gist
    await page.waitForSelector('#createNewGistButton');
    await failNextGitHubRequest(browser);
    await page.click('#createNewGistButton');

    // An informative dialog should display
    await page.waitForSelector('[role=alertdialog]');
    await freezeDialogs(page);
    await closeSnackbars(page);
    await expect(await page.screenshot()).toMatchSnapshot(
      'backendErrorWritingGist.png'
    );
  });

  test('close share flyout by clicking outside of the flyout', async ({
    page,
  }) => {
    await page.goto('/playground/');

    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });

    await page.click('main');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'hidden',
    });
  });

  test('close share flyout by clicking share button again', async ({page}) => {
    await page.goto('/playground/');

    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'visible',
    });

    await page.click('litdev-playground-share-button');
    await page.waitForSelector('litdev-playground-share-button litdev-flyout', {
      state: 'hidden',
    });
  });
});
