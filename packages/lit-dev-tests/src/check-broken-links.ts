/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import blc from 'broken-link-checker';
import * as fs from 'fs';
import * as pathLib from 'path';
import * as url from 'url';

const goodUrlsFilename = pathLib.join(
  url.fileURLToPath(import.meta.url),
  '..',
  '..',
  'known-good-urls.txt'
);

/**
 * A cache of external URLs that have responded successfully in the past.
 *
 * This way, our CI doesn't fail if an external site is being flaky or rate
 * limiting us, but we still check all of our internal links, and we
 * check every new link that we add anywhere on the site.
 */
class KnownGoodUrlCache {
  #urls = new Set<string>();
  #writeStream: fs.WriteStream;
  constructor() {
    const urls = fs
      .readFileSync(goodUrlsFilename, {encoding: 'utf8'})
      .split('\n')
      // filter out blank lines, and lines that start with a # so we support
      // comments
      .filter((f) => !/^\s*#/.test(f) && f.trim().length > 0);
    for (const url of urls) {
      this.#urls.add(url);
    }
    this.#writeStream = fs.createWriteStream(goodUrlsFilename, {flags: 'a'});
  }

  excludedKeywords() {
    return [...this.#urls];
  }

  add(url: string) {
    if (this.#urls.has(url)) {
      return;
    }
    // never cache localhost urls
    if (new URL(url).hostname === 'localhost') {
      return;
    }
    this.#urls.add(url);
    this.#writeStream.write(`${url}\n`);
  }
}

// The broken-link-checker types have a lot of `any`s.
interface LinkResult {
  url: {
    resolved: string;
    original: string;
    redirected?: string;
  };
  base: {
    resolved: string;
    original: string;
  };
  html: unknown; // a parse5 tree
  http: unknown;
  broken: boolean;
  internal: boolean;
  samePage: boolean;
  excluded: boolean;
  brokenReason: string | null;
  excludedReason: string | null;
}

async function main() {
  const knownGoodUrls = new KnownGoodUrlCache();
  let done: () => void;
  const donePromise = new Promise<void>((resolve) => {
    done = resolve;
  });
  const checker = new blc.SiteChecker(
    {
      excludedKeywords: knownGoodUrls.excludedKeywords(),
      excludeExternalLinks: false,
      excludeInternalLinks: false,
      excludeLinksToSamePage: true,
      filterLevel: 1,
      honorRobotExclusions: true,
      maxSockets: Infinity,
      maxSocketsPerHost: 1,
      requestMethod: 'get',
    },
    {
      end() {
        done();
      },
      link(result: LinkResult) {
        if (result.broken) {
          if (result.brokenReason === 'HTTP_429') {
            // We're getting rate limited. Don't fail, but don't cache it as
            // good either.
            return;
          }
          console.log(
            `BROKEN LINK: ${result.url.resolved} found on page ${result.base.resolved}`
          );
          console.log(result.brokenReason);
          console.log();
          process.exitCode = 1;
          return;
        }
        if (result.internal) {
          // don't cache internal links, because we want to check them every time
          // the PR being tested might have removed the linked-to page!
          return;
        }
        if (result.excluded) {
          return;
        }
        // Ok, this is a non-broken, external, not-excluded link. Let's cache it.
        knownGoodUrls.add(result.url.resolved);
      },
    }
  );
  checker.enqueue('http://localhost:6415', {});
  return donePromise;
}

await main();
