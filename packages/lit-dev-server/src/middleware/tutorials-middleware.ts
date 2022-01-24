/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type Koa from 'koa';

/**
 * Koa Middleware to serve '/tutorials/view.html' from '/tutorials/*'.
 */
export const tutorialsMiddleware = (): Koa.Middleware => async (ctx, next) => {
  const path = ctx.request.path;

  /*
   * We want to intercept /tutorials/* but not /tutorials/ itself or the place
   * where we are currently rendering the markdown to html so not
   * /tutorials/content/*
   */
  if (
    path.startsWith('/tutorials/') &&
    !path.startsWith('/tutorials/content/') &&
    path !== '/tutorials/'
  ) {
    ctx.path = '/tutorials/view/index.html';
  }
  await next();
};
