/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {Page} from '@playwright/test';

export const preventGDPRBanner = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('gtag-banner-shown', 'true');
  });
};

export const waitForTheme = async (page: Page, dark: boolean) => {
  await page.waitForSelector('body.auto,body.light,body.dark');

  if (dark) {
    await page.locator('body').evaluate((body) => {
      body.classList.remove('light', 'dark', 'auto');
      body.classList.add('dark');
    });

    return;
  }

  await page.locator('body').evaluate((body) => {
    body.classList.remove('light', 'dark', 'auto');
    body.classList.add('light');
  });
};

export async function waitForPlaygroundPreviewToLoad(page: Page) {
  // We could get a series of iframe reloads, e.g. if we're typing multiple
  // characters, then there could be enough time for multiple previews to get
  // queued up inbetween each keystroke. Assume we've settled when we haven't
  // had an iframe load event for some period of time.
  const iframe = await page.waitForSelector('playground-preview iframe');
  await page.waitForFunction(async (iframe) => {
    const settleTime = 1000;
    await new Promise<void>((resolve) => {
      let timer = setTimeout(resolve, settleTime);
      iframe.addEventListener('load', () => {
        clearTimeout(timer);
        timer = setTimeout(resolve, settleTime);
      });
    });
    return true;
  }, iframe);
  // Hide the animated loading indicator.
  await page.evaluate(
    (el) => {
      el.style.visibility = 'hidden';
    },
    await page.waitForSelector(
      'playground-preview [part="preview-loading-indicator"]',
      {state: 'attached'},
    ),
  );
}

interface MwcSnackbar extends HTMLElement {
  timeoutMs: number;
  open: boolean;
}

/**
 * Prevent any <mwc-snackbar> elements on the page from automatically closing
 * after they are opened, and disable their opacity/transform transitions.
 */
export async function freezeSnackbars(page: Page) {
  for (const snackbar of await page.$$('mwc-snackbar')) {
    await page.evaluate((snackbar) => {
      (snackbar as MwcSnackbar).timeoutMs = -1;
      const surface = snackbar.shadowRoot?.querySelector(
        '.mdc-snackbar__surface',
      );
      if (surface) {
        (surface as HTMLElement).style.transition = 'none';
      }
    }, snackbar);
  }
}

/**
 * Find all <mwc-dialog> elements on the page and disable their
 * transitions/animations.
 */
export async function freezeDialogs(page: Page) {
  for (const dialog of await page.$$('mwc-dialog')) {
    await page.evaluate((dialog) => {
      for (const child of dialog?.shadowRoot?.querySelectorAll('*') ?? []) {
        (child as HTMLElement).style.transition = 'none';
      }
    }, dialog);
  }
}

/**
 * Close any open <mwc-snackbar> elements on the given page.
 */
export async function closeSnackbars(page: Page) {
  for (const snackbar of await page.$$('mwc-snackbar')) {
    await page.evaluate((snackbar) => {
      (snackbar as MwcSnackbar).open = false;
    }, snackbar);
  }
}

/**
 * Read the contents of the clipboard.
 */
export const readClipboardText = async (page: Page): Promise<string> =>
  page.evaluate(() => navigator.clipboard.readText());
