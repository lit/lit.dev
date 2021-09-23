/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Koa from 'koa';
import koaStatic from 'koa-static';
import koaConditionalGet from 'koa-conditional-get';
import koaEtag from 'koa-etag';
import {fileURLToPath} from 'url';
import * as path from 'path';
import {redirectMiddleware} from './middleware/redirect-middleware.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentPackage = path.resolve(
  __dirname,
  '..',
  '..',
  'lit-dev-content',
  '_site'
);
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

app.use(redirectMiddleware());
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
