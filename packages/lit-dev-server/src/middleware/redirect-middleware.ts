/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {pageRedirects} from '../redirects.js';
import type Koa from 'koa';

/**
 * Creates a Koa middleware that performs lit.dev redirection logic.
 */
export const redirectMiddleware = (): Koa.Middleware => async (ctx, next) => {
  // If there would be multiple redirects, resolve them all here so that we
  // serve just one HTTP redirect instead of a chain.
  let path = ctx.path;
  if (path.match(/\/[^\/\.]+$/)) {
    // Canonicalize paths to have a trailing slash, except for files with
    // extensions.
    path += '/';
  }
  if (path.endsWith('//')) {
    // Koa static doesn't care if there are any number of trailing slashes.
    // Normalize this too.
    path = path.replace(/\/+$/, '/');
  }
  path = pageRedirects.get(path) ?? path;
  if (path !== ctx.path) {
    ctx.status = 301;
    ctx.redirect(path + (ctx.querystring ? '?' + ctx.querystring : ''));
  } else {
    await next();
  }
};
