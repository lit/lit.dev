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
import {tutorialsMiddleware} from 'lit-dev-server/lib/middleware/tutorials-middleware.js';
import {contentSecurityPolicyMiddleware} from 'lit-dev-server/lib/middleware/content-security-policy-middleware.js';
import {fakeGitHubMiddleware} from './fake-github-middleware.js';
import {createGitHubTokenExchangeMiddleware} from 'lit-dev-server/lib/middleware/github-token-exchange-middleware.js';
import {dev as ENV} from 'lit-dev-tools-cjs/lib/lit-dev-environments.js';

const THIS_DIR = pathlib.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = pathlib.resolve(THIS_DIR, '..', '..', '..');
const CONTENT_PKG = pathlib.resolve(REPO_ROOT, 'packages', 'lit-dev-content');

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

const staticRoot = pathlib.join(CONTENT_PKG, ENV.eleventyOutDir);

startDevServer({
  config: {
    port: ENV.mainPort,
    rootDir: staticRoot,
    plugins: [
      dontResolveBareModulesInPlaygroundFiles,
      removeWatchScriptFromPlaygroundFiles,
    ],
    middleware: [
      contentSecurityPolicyMiddleware({
        devMode: true,
        playgroundPreviewOrigin: ENV.playgroundSandboxUrl,
        githubApiOrigin: ENV.githubApiUrl,
        githubAvatarOrigin: ENV.githubAvatarUrl,
      }),
      createGitHubTokenExchangeMiddleware({
        clientId: ENV.githubClientId,
        clientSecret: ENV.githubClientSecret,
        githubMainUrl: ENV.githubMainUrl,
      }),
      redirectMiddleware(),
      tutorialsMiddleware(),
    ],
    watch: true,
    nodeResolve: true,
    preserveSymlinks: true,
  },
});

startDevServer({
  config: {
    port: ENV.playgroundPort,
    rootDir: pathlib.resolve(REPO_ROOT, 'node_modules', 'playground-elements'),
    middleware: [playgroundMiddleware()],
  },
  // Ignore any CLI flags. In particular we only want --open to apply to the
  // main server.
  readCliArgs: false,
});

startDevServer({
  config: {
    port: ENV.fakeGithubPort,
    middleware: [
      fakeGitHubMiddleware({
        clientId: ENV.githubClientId,
        clientSecret: ENV.githubClientSecret,
        redirectUrl: ENV.githubAuthorizeRedirectUrl,
      }),
    ],
  },
  // Ignore any CLI flags. In particular we only want --open to apply to the
  // main server.
  readCliArgs: false,
});
