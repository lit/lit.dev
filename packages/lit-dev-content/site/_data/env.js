/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const ENV =
  require('lit-dev-tools-cjs/lib/lit-dev-environments.js').getEnvironment();

const trimTrailingSlash = (str) =>
  str.endsWith('/') ? str.slice(0, str.length - 1) : str;

// Allow templates to access environment settings, e.g. if we are building in
// dev mode or not with `{% if env.DEV %}`.
//
// https://www.11ty.dev/docs/data-js/#example-exposing-environment-variables
module.exports = {
  DEV: ENV.eleventyMode === 'dev',
  MAIN_URL: ENV.mainUrl,
  PLAYGROUND_SANDBOX: ENV.playgroundSandboxUrl,
  GOOGLE_ANALYTICS_ID: ENV.googleAnalyticsId,
  GITHUB_CLIENT_ID: ENV.githubClientId,
  GITHUB_AUTHORIZE_URL: `${trimTrailingSlash(ENV.githubMainUrl)}/login/oauth/authorize`,
  GITHUB_API_URL: ENV.githubApiUrl,
  GITHUB_AVATAR_URL: ENV.githubAvatarUrl,
  SITE_VERSION: ENV.siteVersion
};
