/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type Koa from 'koa';

/**
 * Koa Middleware to serve '/tutorials/view.html' from '/tutorials/*' and to
 * redirect from /tutorial to /tutorials.
 */
export const tutorialsMiddleware = (): Koa.Middleware => async (ctx, next) => {
  const path = ctx.request.path;

  // If acccessing /tutorial or /tutorial/ then redirect to /tutorial
  if (path === '/tutorial/' || path === '/tutorial') {
    ctx.redirect(
      `/tutorials${
        ctx.request.querystring ? `?${ctx.request.querystring}` : ''
      }`
    );
  }

  // We want to intercept /tutorials/* but not /tutorials/ itself or the place
  // where we are currently rendering the markdown to html so not
  // /tutorials/content/*
  if (
    path.startsWith('/tutorials/') &&
    !path.startsWith('/tutorials/content/') &&
    path !== '/tutorials/'
  ) {
    // must end in / and not /index.html in order to fit CSP middleware filter.
    ctx.path = '/tutorials/view/';
  }
  await next();
};
