/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  pageRedirects,
  oldLitHtmlSiteRedirects,
  oldLitElementSiteRedirects,
} from '../redirects.js';

import type Koa from 'koa';

/**
 * Creates a Koa middleware that performs lit.dev redirection logic.
 */
export const redirectMiddleware = (): Koa.Middleware => async (ctx, next) => {
  // If there would be multiple redirects, resolve them all here so that we
  // serve just one HTTP redirect instead of a chain.
  let url = new URL(ctx.URL);
  switch (url.hostname) {
    case 'www.lit.dev': {
      url.hostname = 'lit.dev';
      break;
    }
    case 'lit-html.polymer-project.org': {
      url.hostname = 'lit.dev';
      // Note we can't set pathname directly here, because the paths in our
      // redirect maps contain hashes, which need to be parsed as such, instead
      // of as an escaped path component.
      url = new URL(
        oldLitHtmlSiteRedirects.get(url.pathname) ?? '/404-not-found/',
        url
      );
      break;
    }
    case 'lit-element.polymer-project.org': {
      url.hostname = 'lit.dev';
      url = new URL(
        oldLitElementSiteRedirects.get(url.pathname) ?? '/404-not-found/',
        url
      );
      break;
    }
  }
  if (url.pathname.match(/\/[^\/\.]+$/)) {
    // Canonicalize paths to have a trailing slash, except for files with
    // extensions.
    url.pathname += '/';
  } else if (url.pathname.endsWith('//')) {
    // Koa static doesn't care if there are any number of trailing slashes.
    // Normalize this too.
    url.pathname = url.pathname.replace(/\/+$/, '/');
  }
  const newPath = pageRedirects.get(url.pathname);
  if (newPath !== undefined) {
    url = new URL(newPath, url);
  }
  if (url.href !== ctx.URL.href) {
    ctx.status = 301;
    ctx.redirect(url.href);
  } else {
    await next();
  }
};
