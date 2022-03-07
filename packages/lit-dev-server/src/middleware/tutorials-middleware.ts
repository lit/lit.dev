/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type Koa from 'koa';

const TUTORIAL_MOD = 'tutorialCatalog';

/**
 * Koa Middleware to serve '/tutorials/view.html' from '/tutorials/*' and to
 * redirect to tutorial if tutorialCatalog mod is not enabled.
 */
export const tutorialsMiddleware = (): Koa.Middleware => async (ctx, next) => {
  const path = ctx.request.path;
  const modsQuery = ctx.request.query.mods;
  let hasTutorialsMod = false;

  if (typeof modsQuery === 'string' || modsQuery instanceof String) {
    hasTutorialsMod = modsQuery.split(' ').includes(TUTORIAL_MOD);
  } else if (modsQuery instanceof Array) {
    hasTutorialsMod = modsQuery.includes(TUTORIAL_MOD);
  }

  // If acccessing /tutorials or /tutorials/ but there is no
  // ?mods=tutorialCatalog query, then redirect to /tutorial
  if ((path === '/tutorials/' || path === '/tutorials') && !hasTutorialsMod) {
    ctx.redirect(
      `/tutorial${ctx.request.querystring ? `?${ctx.request.querystring}` : ''}`
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
