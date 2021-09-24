/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type Koa from 'koa';

/**
 * Middleware for the Playground server.
 */
export const playgroundMiddleware = (): Koa.Middleware => async (ctx, next) => {
  // See https://github.com/PolymerLabs/playground-elements#process-isolation
  ctx.set('Origin-Agent-Cluster', '?1');
  await next();
};
