/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {startDevServer, DevServerConfig} from '@web/dev-server';
import {fileURLToPath} from 'url';
import * as pathlib from 'path';
import {redirectMiddleware} from 'lit-dev-server/lib/middleware/redirect-middleware.js';
import {playgroundMiddleware} from 'lit-dev-server/lib/middleware/playground-middleware.js';
import {contentSecurityPolicyMiddleware} from 'lit-dev-server/lib/middleware/content-security-policy-middleware.js';
import {fakeGitHubMiddleware} from 'lit-dev-server/lib/middleware/fake-github-middleware.js';

const THIS_DIR = pathlib.dirname(fileURLToPath(import.meta.url));
const CONTENT_PKG = pathlib.resolve(THIS_DIR, '..', '..', 'lit-dev-content');
const MAIN_PORT = 5415;
const PLAYGROUND_PORT = 5416;
const FAKE_GITHUB_PORT = 5417;

type DevServerPlugin = Exclude<DevServerConfig['plugins'], undefined>[number];

/**
 * Since we're using the `nodeResolve` setting, @web/dev-server automatically
 * resolves any bare module specifiers it finds in any .js file it serves.
 *
 * However, when serving a .js file from a Playground project, we don't want
 * this resolution to occur, because we want to display the raw file in the
 * editor, and we want to do our own bare module resolution within the
 * Playground web worker.
 *
 * This plugin overrides bare module resolution for anything served from the
 * Playground samples directory to preserve the original specifier.
 */
const dontResolveBareModulesInPlaygroundFiles: DevServerPlugin = {
  name: 'dont-resolve-bare-modules-in-playground-files',
  async resolveImport({source, context}) {
    if (context.path.startsWith('/samples/')) {
      return source;
    }
    return;
  },
};

/**
 * Since we're using the `watch` setting, @web/dev-server injects a script into
 * any .html file it serves that listens for changes and reloads the page.
 *
 * However, when serving an .html file from a Playground project, we don't want
 * this script to be injected, because we want to display the raw file in the
 * editor, and we don't need the HTML preview to reload (since the parent will
 * reload anyway).
 *
 * This plugin removes the script for anything served from the Playground
 * samples directory.
 *
 * See https://github.com/modernweb-dev/web/issues/761 for a feature request to
 * make this easier.
 */
const removeWatchScriptFromPlaygroundFiles: DevServerPlugin = {
  name: 'remove-watch-script-from-playground-files',
  transform(ctx) {
    if (ctx.url.startsWith('/samples/')) {
      return {
        body: (ctx.body as string).replace(
          /<!-- injected by web-dev-server.*<\/script>/gs,
          ''
        ),
      };
    }
    return;
  },
};

startDevServer({
  config: {
    port: MAIN_PORT,
    rootDir: pathlib.join(CONTENT_PKG, '_dev'),
    plugins: [
      dontResolveBareModulesInPlaygroundFiles,
      removeWatchScriptFromPlaygroundFiles,
    ],
    middleware: [
      contentSecurityPolicyMiddleware({
        devMode: true,
        playgroundPreviewOrigin: `http://localhost:${PLAYGROUND_PORT}`,
      }),
      redirectMiddleware(),
    ],
    watch: true,
    nodeResolve: true,
    preserveSymlinks: true,
  },
});

startDevServer({
  config: {
    port: PLAYGROUND_PORT,
    rootDir: pathlib.resolve(
      CONTENT_PKG,
      'node_modules',
      'playground-elements'
    ),
    middleware: [playgroundMiddleware()],
  },
  // Ignore any CLI flags. In particular we only want --open to apply to the
  // main server.
  readCliArgs: false,
});

startDevServer({
  config: {
    port: FAKE_GITHUB_PORT,
    middleware: [
      fakeGitHubMiddleware({
        clientId: 'FAKE_CLIENT_ID',
        clientSecret: 'FAKE_APP_SECRET',
        redirectUrl: `http://localhost:${MAIN_PORT}/playground/signin/`,
      }),
    ],
  },
  // Ignore any CLI flags. In particular we only want --open to apply to the
  // main server.
  readCliArgs: false,
});
