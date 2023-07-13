/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Koa from 'koa';
import {fakeGitHubMiddleware} from './fake-github-middleware.js';
import {getEnvironment} from 'lit-dev-tools-cjs/lib/lit-dev-environments.js';

const ENV = getEnvironment();

const envRequired = <T extends keyof typeof ENV>(name: T) => {
  const val = ENV[name];
  if (!val) {
    throw new Error(`Expected ENV.${name} to be defined.`);
  }
  return val as Exclude<typeof ENV[T], undefined>;
};

const app = new Koa();
app.use(
  fakeGitHubMiddleware({
    clientId: envRequired('githubClientId'),
    clientSecret: envRequired('githubClientSecret'),
    redirectUrl: envRequired('githubAuthorizeRedirectUrl'),
  })
);
app.listen(ENV.fakeGithubPort);
console.log(`fake github server listening on port ${ENV.fakeGithubPort}`);
