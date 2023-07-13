/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test, expect} from '@playwright/test';
import {fileURLToPath} from 'url';
import * as path from 'path';
import {readFileSync} from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const CONTENT_PKG = path.resolve(REPO_ROOT, 'packages', 'lit-dev-content');
const SITE_JSON = path.resolve(CONTENT_PKG, 'site', 'site.json');

// Pull the latest version from our site.json data file.
const SITE_LATEST_VERSION = (
  JSON.parse(readFileSync(SITE_JSON, 'utf8')) as {latestVersion: string}
).latestVersion;

test.describe('Unversioned docs', () => {
  test('match latest docs text content exactly', async ({browser}) => {
    const unversionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    const versionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    await Promise.all([
      unversionedPage.goto('/docs'),
      versionedPage.goto(`/docs/${SITE_LATEST_VERSION}`),
    ]);

    const [unversionedTextContent, versionedTextContent] = await Promise.all([
      unversionedPage.textContent('article'),
      versionedPage.textContent('article'),
    ]);

    expect(unversionedTextContent).toEqual(versionedTextContent);
  });

  test('are referenced as the canonical doc from the versioned duplicate', async ({
    browser,
  }) => {
    const unversionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    const versionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    await Promise.all([
      unversionedPage.goto('/docs'),
      versionedPage.goto(`/docs/${SITE_LATEST_VERSION}`),
    ]);

    const canonicalHref = await versionedPage
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(canonicalHref).toEqual('https://lit.dev/docs/');

    // unversioned page should not have a canonical link.
    await expect(unversionedPage.locator('link[rel="canonical"]')).toHaveCount(
      0
    );
  });

  test('have cross-links to other unversioned docs', async ({browser}) => {
    const unversionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    await unversionedPage.goto('/docs');

    const gettingStartedLocator = unversionedPage.locator('article#content a', {
      hasText: 'Code organization',
    });
    await expect(gettingStartedLocator).toHaveAttribute(
      'href',
      '/docs/composition/overview/'
    );
  });

  test('cross-link to correct api URL', async ({browser}) => {
    const unversionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    const versionedPage = await browser.newPage({
      viewport: {width: 1920, height: 1080},
    });
    await Promise.all([
      unversionedPage.goto('/docs/components/decorators/'),
      versionedPage.goto(`/docs/${SITE_LATEST_VERSION}/components/decorators/`),
    ]);

    const versionedPropertyDecoratorLink = versionedPage.locator(
      'article#content table a',
      {
        hasText: '@property',
      }
    );
    const unversionedPropertyDecoratorLink = unversionedPage.locator(
      'article#content table a',
      {
        hasText: '@property',
      }
    );
    await expect(versionedPropertyDecoratorLink).toHaveAttribute(
      'href',
      `/docs/${SITE_LATEST_VERSION}/api/decorators#property`
    );
    await expect(unversionedPropertyDecoratorLink).toHaveAttribute(
      'href',
      `/docs/api/decorators#property`
    );
  });
});
