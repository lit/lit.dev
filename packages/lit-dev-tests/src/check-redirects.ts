/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathLib from 'path';
import * as fs from 'fs/promises';
import ansi from 'ansi-escape-sequences';
import fetch from 'node-fetch';
import {
  pageRedirects,
  oldLitElementSiteRedirects,
  oldLitHtmlSiteRedirects,
} from 'lit-dev-server/lib/redirects.js';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathLib.dirname(__filename);

const {red, green, yellow, bold, reset} = ansi.style;

const OK = Symbol();
type ErrorMessage = string;

const isAbsoluteUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const trimTrailingSlash = (str: string) =>
  str.endsWith('/') ? str.slice(0, str.length - 1) : str;

const siteOutputDir = pathLib.resolve(
  __dirname,
  '../',
  '../',
  'lit-dev-content',
  '_site'
);

const checkRedirect = async (
  redirect: string
): Promise<ErrorMessage | typeof OK> => {
  if (isAbsoluteUrl(redirect)) {
    // Remote URLs.
    let res;
    try {
      res = await fetch(redirect);
    } catch (e) {
      return `Fetch error: ${(e as Error).message}`;
    }
    if (res.status !== 200) {
      return `HTTP ${res.status} error`;
    }
  } else {
    // Local paths. A bit hacky, but since we know how Eleventy works, we don't
    // need to actually run the server, we can just look directly in the built
    // HTML output directory.
    const {pathname, hash} = new URL(redirect, 'http://lit.dev');
    const indexHtmlPath = pathLib.relative(
      process.cwd(),
      pathLib.join(siteOutputDir, trimTrailingSlash(pathname), 'index.html')
    );
    const directPath = pathLib.relative(
      process.cwd(),
      pathLib.join(siteOutputDir, trimTrailingSlash(pathname))
    );
    let data;
    try {
      data = await Promise.any([
        fs.readFile(indexHtmlPath, {encoding: 'utf8'}),
        fs.readFile(directPath, {encoding: 'utf8'}),
      ]);
    } catch {
      return `Could not find file matching path ${pathname}
Searched for file ${indexHtmlPath} or ${directPath}`;
    }
    if (hash) {
      if (pathname === '/learn/' && hash.includes('filter')) {
        return OK;
      }
      // Another hack. Just do a regexp search for e.g. id="somesection" instead
      // of DOM parsing. Should be good enough, especially given how regular our
      // Markdown generated HTML is.
      const idAttrRegExp = new RegExp(`\\sid=["']?${hash.slice(1)}["']?[\\s>]`);
      if (data.match(idAttrRegExp) === null) {
        return `Could not find section matching hash ${hash}.
Searched in file ${indexHtmlPath}`;
      }
    }
  }
  return OK;
};

const checkAllRedirects = async () => {
  console.log('==========================');
  console.log('Checking lit.dev redirects');
  console.log('==========================');
  console.log();

  let fail = false;
  const promises = [];
  const allRedirectTargets = new Set([
    ...pageRedirects.values(),
    ...oldLitElementSiteRedirects.values(),
    ...oldLitHtmlSiteRedirects.values(),
  ]);
  for (const target of allRedirectTargets) {
    promises.push(
      (async () => {
        const result = await checkRedirect(target);
        if (result === OK) {
          console.log(`${bold + green}OK${reset} ${target}`);
        } else {
          console.log();
          console.log(
            `${bold + red}BROKEN REDIRECT${reset} ${yellow + target + reset}`
          );
          console.log(result);
          console.log();
          fail = true;
        }
      })()
    );
  }
  await Promise.all(promises);
  console.log();
  if (fail) {
    console.log('Redirects were broken!');
    process.exit(1);
  } else {
    console.error('All redirects OK!');
  }
};

checkAllRedirects();
