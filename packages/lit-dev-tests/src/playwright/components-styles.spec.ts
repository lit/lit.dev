/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {preventGDPRBanner, waitForTheme} from './util.js';

function runTests(dark: boolean) {
  test.describe('docs/components/styles', () => {
    test.beforeEach(async ({page}) => {
      await preventGDPRBanner(page);
    });

    test(`inheriting-styles-from-a-superclass preview golden${
      dark ? ' - dark' : ''
    }`, async ({page}) => {
      await page.goto(
        '/docs/components/styles/#inheriting-styles-from-a-superclass',
      );

      // Wait for the exact playground preview we want to load.
      await page.waitForSelector(
        'litdev-example[project="v3-docs/components/style/superstyles"] playground-preview [part="preview-loading-indicator"][aria-hidden="true"]',
      );
      // Wait for the loading bar to fade out.
      await page.waitForTimeout(250);

      await waitForTheme(page, dark);

      await expect(
        await page
          .locator(
            'litdev-example[project="v3-docs/components/style/superstyles"] playground-preview',
          )
          .screenshot(),
      ).toMatchSnapshot(
        `inheritingStylesPlaygroundPreview${dark ? '-dark' : ''}.png`,
      );
    });
  });
}

runTests(false);
runTests(true);
