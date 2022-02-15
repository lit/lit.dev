/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import send from 'koa-send';

import type Koa from 'koa';

/**
 * Creates a Koa middleware that serves a 404.html page on 404 status codes.
 */
export const notFoundMiddleware =
  (staticRoot: string): Koa.Middleware =>
  async (ctx, next) => {
    // Run other middleware first, so the 404 is handled last.
    await next();

    if (ctx.status === 404) {
      await send(ctx, '/404/index.html', {root: staticRoot});
      ctx.status = 404;
    }
  };
