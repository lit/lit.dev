/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {Page} from '@playwright/test';

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
  // Wait for the loading indicator to stop for screenshots.
  await page.waitForSelector(
    'playground-preview [part="preview-loading-indicator"][aria-hidden="true"]'
  );
  // There is a fade-out transition on the playground loading bar that makes
  // screenshots flaky. Wait for the loading bar to have animated out.
  await page.waitForTimeout(250);
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
        '.mdc-snackbar__surface'
      );
      if (surface) {
        (surface as HTMLElement).style.transition = 'none';
      }
    }, snackbar);
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
