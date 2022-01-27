/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import send from 'koa-send';

import type Koa from 'koa';

/**
 * Create a Koa middleware that serves a 404.html page on 404 status codes.
 */
export const notFoundMiddleware =
  (staticPath: string): Koa.Middleware =>
  async (ctx) => {
    if (ctx.status === 404) {
      await send(ctx, '/404/index.html', {root: staticPath});
    }
  };
