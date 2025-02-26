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
import * as fs from 'fs';
import {redirectMiddleware} from './middleware/redirect-middleware.js';
import {playgroundMiddleware} from './middleware/playground-middleware.js';
import {tutorialsMiddleware} from './middleware/tutorials-middleware.js';
import {contentSecurityPolicyMiddleware} from './middleware/content-security-policy-middleware.js';
import {createGitHubTokenExchangeMiddleware} from './middleware/github-token-exchange-middleware.js';
import {notFoundMiddleware} from './middleware/notfound-middleware.js';
import {getEnvironment} from 'lit-dev-tools-cjs/lib/lit-dev-environments.js';

const ENV = getEnvironment();

const mode = process.env.MODE;
if (mode !== 'main' && mode !== 'playground') {
  console.error(`MODE env must be "main" or "playground", was "${mode}"`);
  process.exit(1);
}
const port = mode === 'main' ? ENV.mainPort : ENV.playgroundPort;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const contentPackage = path.resolve(repoRoot, 'packages', 'lit-dev-content');
const staticRoot =
  mode === 'playground'
    ? path.join(repoRoot, 'node_modules', 'playground-elements')
    : path.join(contentPackage, ENV.eleventyOutDir);

console.log(`mode: ${mode}`);
console.log(`port: ${port}`);
console.log(`static root: ${staticRoot}`);

const app = new Koa();

if (mode === 'playground') {
  app.use(playgroundMiddleware());
} else {
  const inlineScriptHashes = fs
    .readFileSync(
      path.join(
        contentPackage,
        ENV.eleventyOutDir,
        'csp-inline-script-hashes.txt'
      ),
      'utf8'
    )
    .trim()
    .split('\n');
  const playgroundPreviewOrigin = ENV.playgroundSandboxUrl;
  app.use(
    contentSecurityPolicyMiddleware({
      inlineScriptHashes,
      playgroundPreviewOrigin,
      reportViolations: ENV.reportCspViolations,
      githubApiOrigin: ENV.githubApiUrl,
      githubAvatarOrigin: ENV.githubAvatarUrl,
    })
  );
  app.use(
    createGitHubTokenExchangeMiddleware({
      githubMainUrl: ENV.githubMainUrl,
      clientId: ENV.githubClientId,
      clientSecret: ENV.githubClientSecret,
    })
  );
  app.use(redirectMiddleware());
  app.use(notFoundMiddleware(staticRoot));
}

app.use(koaConditionalGet()); // Needed for etag
app.use(koaEtag());
app.use(tutorialsMiddleware());
app.use(
  koaStatic(staticRoot, {
    // Serve pre-compressed .br and .gz files if available.
    brotli: true,
    gzip: true,
    setHeaders(res, path) {
      // TODO(aomarks) Oddly can't access the request URL path from this API.
      // This `path` is the path on disk. Works for now, though.
      if (path.includes('/fonts/')) {
        res.setHeader('Cache-Control', 'max-age=31536000');
      }
      if (path.includes('/playground-typescript-worker.js')) {
        // This is a huge file, so we want to cache the request for 2 minutes
        // which should basically handle a page with multiple playgrounds.
        // Then after those two minutes, it will use the same cached file for a
        // day while it revalidates the cache in the background.
        res.setHeader(
          'Cache-Control',
          'max-age=120, stale-while-revalidate=86400'
        );
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
