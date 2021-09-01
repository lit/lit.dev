/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathLib from 'path';
import * as fs from 'fs/promises';
import ansi from 'ansi-escape-sequences';
import fetch from 'node-fetch';
import {pageRedirects} from 'lit-dev-server/redirects.js';
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
    const diskPath = pathLib.relative(
      process.cwd(),
      pathLib.join(siteOutputDir, trimTrailingSlash(pathname), 'index.html')
    );
    let data;
    try {
      data = await fs.readFile(diskPath, {encoding: 'utf8'});
    } catch {
      return `Could not find file matching path ${pathname}
Searched for file ${diskPath}`;
    }
    if (hash) {
      // Another hack. Just do a regexp search for e.g. id="somesection" instead
      // of DOM parsing. Should be good enough, especially given how regular our
      // Markdown generated HTML is.
      const idAttrRegExp = new RegExp(`\\sid=["']?${hash.slice(1)}["']?[\\s>]`);
      if (data.match(idAttrRegExp) === null) {
        return `Could not find section matching hash ${hash}.
Searched in file ${diskPath}`;
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
  for (const [from, to] of pageRedirects) {
    promises.push(
      (async () => {
        const result = await checkRedirect(to);
        if (result === OK) {
          console.log(`${bold + green}OK${reset} ${from} -> ${to}`);
        } else {
          console.log();
          console.log(
            `${bold + red}BROKEN REDIRECT${reset} ${from} -> ${
              yellow + to + reset
            }`
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
