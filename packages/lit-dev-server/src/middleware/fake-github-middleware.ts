/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type Koa from 'koa';

/**
 * Options for fakeGitHubMiddleware.
 */
export interface FakeGitHubMiddlewareOptions {
  /**
   * GitHub OAuth App client ID.
   *
   * In reality, this is generated when a GitHub OAuth App is first created. For
   * this fake, it can be any string.
   */
  clientId: string;

  /**
   * GitHub OAuth app secret.
   *
   * In reality, this is generated from the GitHub OAuth App settings screen.
   * For this fake, it can be any string.
   */
  clientSecret: string;

  /**
   * URL to redirect to after app authentication or installation.
   *
   * In reality, this is configured in the GitHub OAuth App settings screen. For
   * this fake, it can be any URL.
   */
  redirectUrl: string;
}

/**
 * Koa middleware that simulates various GitHub APIs and authentication screens
 * used by the lit.dev Playground.
 */
export const fakeGitHubMiddleware = (
  options: FakeGitHubMiddlewareOptions
): Koa.Middleware => {
  let fake = new FakeGitHub(options);
  return async (ctx, next) => {
    if (ctx.path === '/reset') {
      return fake.reset(ctx);
    } else if (ctx.path === '/login/oauth/authorize') {
      return fake.authorize(ctx);
    } else if (ctx.path === '/login/oauth/access_token') {
      return fake.accessToken(ctx);
    } else {
      return next();
    }
  };
};

const randomString = () => String(Math.floor(Math.random() * 1e10));

class FakeGitHub {
  private readonly _options: FakeGitHubMiddlewareOptions;
  private readonly _codeToUserIdAndScope = new Map<
    string,
    {userId: string; scope: string}
  >();

  constructor(options: FakeGitHubMiddlewareOptions) {
    this._options = options;
  }

  /**
   * Generate a random user ID for this session and persist it in a cookie.
   */
  private _getOrSetUserIdFromCookie(ctx: Koa.Context) {
    let userId = ctx.cookies.get('userid');
    if (!userId) {
      userId = randomString();
      ctx.cookies.set('userid', userId);
    }
    return userId;
  }

  /**
   * Clear all server state and browser cookies.
   *
   * Note this is not a real GitHub API. It is a convenience for developing and
   * testing with this fake server, so that we can quickly reset to a
   * pre-authenticated state.
   */
  reset(ctx: Koa.Context) {
    this._codeToUserIdAndScope.clear();
    ctx.cookies.set('userid', null);
    ctx.cookies.set('authorized', null);
    ctx.status = 200;
    ctx.body = 'fake github successfully reset';
  }

  /**
   * Simulates https://github.com/login/oauth/authorize, the screen that prompts
   * a user to authorize a GitHub OAuth App.
   *
   * Documentation:
   * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
   */
  authorize(ctx: Koa.Context) {
    const req = ctx.query as {client_id?: string; scope?: string};
    if (req.client_id !== this._options.clientId) {
      ctx.status = 400;
      ctx.body = 'error: missing or incorrect client_id url parameter';
      return;
    }

    const scope = req.scope ?? '';
    const userId = this._getOrSetUserIdFromCookie(ctx);
    const code = `fake-code-${randomString()}`;
    this._codeToUserIdAndScope.set(code, {userId, scope});

    const authorizeUrl = `${this._options.redirectUrl}?code=${code}`;
    const cancelUrl = `${this._options.redirectUrl}?error=access_denied`;
    if (ctx.cookies.get('authorized')) {
      return ctx.redirect(authorizeUrl);
    }

    ctx.status = 200;
    ctx.type = 'text/html';
    ctx.body = `
      <h2>Fake GitHub authorization prompt</h2>

      <button onclick="authorize()">Authorize</button>
      <button onclick="cancel()">Cancel</button>

      <script>
        function authorize() {
          document.cookie = 'authorized=1;path=/';
          location.assign("${authorizeUrl}");
        }
        function cancel() {
          location.assign("${cancelUrl}");
        }
      </script>
    `;
  }

  /**
   * Simulates https://github.com/login/oauth/access_token, the API that
   * exchanges a temporary GitHub OAuth code for a longer term authentication
   * token.
   *
   * Documentation:
   * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
   */
  async accessToken(ctx: Koa.Context) {
    const req = ctx.query as {
      code?: string;
      client_id?: string;
      client_secret?: string;
    };
    if (!req.code || !req.client_id || !req.client_secret) {
      ctx.status = 400;
      ctx.body =
        'error: missing or incorrect code, client_id, and/or client_secret';
      return;
    }

    if (req.client_secret !== this._options.clientSecret) {
      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({error: 'incorrect_client_credentials'});
      return;
    }

    const info = this._codeToUserIdAndScope.get(req.code);
    if (info === undefined) {
      // TODO(aomarks) Could also simulate the 10 minute expiry, but since the
      // error returned is indistinguishable from a completely invalid code,
      // there doesn't seem to be much point.
      ctx.status = 200;
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({error: 'bad_verification_code'});
      return;
    }
    this._codeToUserIdAndScope.delete(req.code);

    // TODO(aomarks) Store this so that it can be checked by the gist APIs.
    const accessToken = `fake-token-${randomString()}`;

    ctx.status = 200;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({
      access_token: accessToken,
      scope: info.scope,
      token_type: 'bearer',
    });
  }
}
