/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Koa from 'koa';
import koaStatic from 'koa-static';
import koaConditionalGet from 'koa-conditional-get';
import koaEtag from 'koa-etag';
import {createRequire} from 'module';
import * as path from 'path';
import {pageRedirects} from './redirects.js';

const mode = process.env.MODE;
if (mode !== 'main' && mode !== 'playground') {
  console.error(`MODE env must be "main" or "playground", was "${mode}"`);
  process.exit(1);
}
const port = Number(process.env.PORT);
if (isNaN(port)) {
  console.error(`PORT env must be a number, was "${process.env.PORT}"`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const contentPackage = path.dirname(require.resolve('lit-dev-content'));
const staticRoot =
  mode === 'playground' ? path.join(contentPackage, 'js') : contentPackage;

console.log(`mode: ${mode}`);
console.log(`port: ${port}`);
console.log(`static root: ${staticRoot}`);

const app = new Koa();

if (mode === 'playground') {
  // See https://github.com/PolymerLabs/playground-elements#process-isolation
  app.use(async (ctx, next) => {
    ctx.set('Origin-Agent-Cluster', '?1');
    await next();
  });
}

app.use(async (ctx, next) => {
  if (ctx.path.match(/\/[^\/\.]+$/)) {
    // Canonicalize paths to have a trailing slash, except for files with
    // extensions.
    ctx.status = 301;
    ctx.redirect(
      ctx.path + '/' + (ctx.querystring ? '?' + ctx.querystring : '')
    );
  } else if (ctx.path.endsWith('//')) {
    // Koa static doesn't care if there are any number of trailing slashes.
    // Normalize this too.
    ctx.status = 301;
    ctx.redirect(
      ctx.path.replace(/\/+$/, '/') +
        (ctx.querystring ? '?' + ctx.querystring : '')
    );
  } else if (pageRedirects.has(ctx.path)) {
    // Handle any 1:1 page redirects
    ctx.status = 301;
    ctx.redirect(
      pageRedirects.get(ctx.path) +
        (ctx.querystring ? '?' + ctx.querystring : '')
    );
  } else {
    await next();
  }
});

app.use(koaConditionalGet()); // Needed for etag
app.use(koaEtag());
app.use(
  koaStatic(staticRoot, {
    // Serve pre-compressed .br and .gz files if available.
    brotli: true,
    gzip: true,
    setHeaders(res, path) {
      // TODO(aomarks) Oddly can't access the request URL path from this API.
      // This `path` is the path on disk. Works for now, though.
      if (path.includes('/fonts/')) {
        res.setHeader('Cache-Control', 'max-age=3600');
      }
    },
  })
);

const server = app.listen(port);
console.log(`server listening on port ${port}`);

// Node only automatically exits on SIGINT when the PID is not 1 (e.g. launched
// as the child of a shell process). When the Node PID is 1 (e.g. launched with
// Docker `CMD ["node", ...]`) then it's our responsibility.
let shuttingDown = false;
process.on('SIGINT', () => {
  if (!shuttingDown) {
    // First signal: try graceful shutdown and let Node exit normally.
    server.close();
    shuttingDown = true;
  } else {
    // Second signal: somebody really wants to exit.
    process.exit(1);
  }
});
