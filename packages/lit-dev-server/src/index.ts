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

const require = createRequire(import.meta.url);
const contentPackage = require.resolve('lit-dev-content');
const contentDir = path.dirname(contentPackage);

console.log('contentPackage', contentPackage);
console.log('contentDir', contentDir);

const app = new Koa();
app.use(koaConditionalGet()); // Needed for etag
app.use(koaEtag());
app.use(
  koaStatic(contentDir, {
    // Serve pre-compressed .br and .gz files if available.
    brotli: true,
    gzip: true,
  })
);

const port = process.env.PORT || 8080;
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
