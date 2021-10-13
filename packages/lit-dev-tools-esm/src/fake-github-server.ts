/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Koa from 'koa';
import {fakeGitHubMiddleware} from './fake-github-middleware.js';
import {getEnvironment} from 'lit-dev-tools-cjs/lib/lit-dev-environments.js';

const ENV = getEnvironment();

const app = new Koa();
app.use(
  fakeGitHubMiddleware({
    clientId: ENV.githubClientId!,
    clientSecret: ENV.githubClientSecret!,
    redirectUrl: ENV.githubAuthorizeRedirectUrl!,
  })
);
app.listen(ENV.fakeGithubPort);
console.log(`fake github server listening on port ${ENV.fakeGithubPort}`);
