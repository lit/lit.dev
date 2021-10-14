/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import coBody from 'co-body';

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
    if (ctx.method === 'OPTIONS') {
      // CORS preflight
      ctx.status = 204;
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Headers', 'Authorization');
      return;
    } else if (ctx.path === '/reset') {
      return fake.reset(ctx);
    } else if (ctx.path === '/login/oauth/authorize') {
      return fake.authorize(ctx);
    } else if (ctx.path === '/login/oauth/access_token') {
      return fake.accessToken(ctx);
    } else if (ctx.path === '/gists' && ctx.method === 'POST') {
      return fake.createGist(ctx);
    } else if (ctx.path.startsWith('/gists/') && ctx.method === 'GET') {
      return fake.getGist(ctx);
    } else {
      return next();
    }
  };
};

const randomNumber = () => Math.floor(Math.random() * 1e10);

interface UserAndScope {
  userId: number;
  scope: string;
}

interface GistFile {
  filename: string;
  content: string;
}

interface CreateGistRequest {
  files: {[filename: string]: GistFile};
}

interface GetGistResponse {
  id: string;
  files: {[filename: string]: GistFile};
  owner: {id: number};
}

const jsonResponse = (
  ctx: Koa.Context,
  status: number,
  response: any
): void => {
  ctx.status = status;
  ctx.type = 'application/json';
  ctx.body = JSON.stringify(response);
};

class FakeGitHub {
  private readonly _options: FakeGitHubMiddlewareOptions;
  private readonly _temporaryCodes = new Map<string, UserAndScope>();
  private readonly _accessTokens = new Map<string, UserAndScope>();
  private readonly _gists = new Map<string, GetGistResponse>();

  constructor(options: FakeGitHubMiddlewareOptions) {
    this._options = options;
  }

  /**
   * Generate a random user ID for this session and persist it in a cookie.
   */
  private _getOrSetUserIdFromCookie(ctx: Koa.Context): number {
    let userIdStr = ctx.cookies.get('userid');
    let userId = userIdStr ? Number(userIdStr) : undefined;
    if (userId === undefined) {
      userId = randomNumber();
      ctx.cookies.set('userid', String(userId));
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
    this._temporaryCodes.clear();
    this._accessTokens.clear();
    this._gists.clear();
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
    const code = `fake-code-${randomNumber()}`;
    this._temporaryCodes.set(code, {userId, scope});

    const authorizeUrl = `${this._options.redirectUrl}?code=${code}`;
    const cancelUrl = `${this._options.redirectUrl}?error=access_denied`;
    if (ctx.cookies.get('authorized')) {
      return ctx.redirect(authorizeUrl);
    }

    ctx.status = 200;
    ctx.type = 'text/html';
    ctx.body = `
      <h2>Fake GitHub authorization prompt</h2>

      <button onclick="cancel()">Cancel</button>
      <button style="background:green;color:white"
              onclick="authorize()">Authorize lit</button>

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
    if (ctx.get('accept') !== 'application/json') {
      ctx.status = 400;
      ctx.body = 'error: expected accept: application/json request header';
      return;
    }

    if (req.client_secret !== this._options.clientSecret) {
      return jsonResponse(ctx, 200, {
        error: 'incorrect_client_credentials',
      });
    }

    const userAndScope = this._temporaryCodes.get(req.code);
    if (userAndScope === undefined) {
      // TODO(aomarks) Could also simulate the 10 minute expiry, but since the
      // error returned is indistinguishable from a completely invalid code,
      // there doesn't seem to be much point.
      return jsonResponse(ctx, 200, {error: 'bad_verification_code'});
    }
    this._temporaryCodes.delete(req.code);

    // TODO(aomarks) Store this so that it can be checked by the gist APIs.
    const accessToken = `fake-token-${randomNumber()}`;
    this._accessTokens.set(accessToken, userAndScope);

    return jsonResponse(ctx, 200, {
      access_token: accessToken,
      scope: userAndScope.scope,
      token_type: 'bearer',
    });
  }

  /**
   * Simulates GET https://api.github.com/gists/<id>, the API for getting a
   * GitHub gist.
   *
   * Documentation:
   * https://docs.github.com/en/rest/reference/gists#get-a-gist
   */
  async getGist(ctx: Koa.Context) {
    ctx.set('Access-Control-Allow-Origin', '*');
    const accept = ctx.get('accept');
    if (accept !== 'application/vnd.github.v3+json') {
      return jsonResponse(ctx, 415, {
        message: "Unsupported 'Accept' header",
      });
    }
    const match = ctx.path.match(/^\/gists\/(?<id>.+)/);
    const id = match?.groups?.id;
    if (!id) {
      return jsonResponse(ctx, 400, {message: 'Invalid gist request'});
    }
    const gist = this._gists.get(id);
    if (!gist) {
      return jsonResponse(ctx, 404, {message: 'Not Found'});
    }
    return jsonResponse(ctx, 200, gist);
  }

  /**
   * Simulates POST https://api.github.com/gists/, the API for creating a GitHub
   * gist.
   *
   * Documentation:
   * https://docs.github.com/en/rest/reference/gists#create-a-gist
   */
  async createGist(ctx: Koa.Context) {
    ctx.set('Access-Control-Allow-Origin', '*');
    const accept = ctx.get('accept');
    if (accept !== 'application/vnd.github.v3+json') {
      return jsonResponse(ctx, 415, {
        message: "Unsupported 'Accept' header",
      });
    }

    const authMatch = (ctx.get('authorization') ?? '').match(
      /^\s*(?:token|bearer)\s(?<token>.+)$/
    );
    const authToken = authMatch?.groups?.token?.trim() ?? '';
    const userAndScope = this._accessTokens.get(authToken);
    if (!userAndScope) {
      return jsonResponse(ctx, 401, {message: 'Bad credentials'});
    }

    let createRequest: CreateGistRequest;
    try {
      createRequest = await coBody.json(ctx);
    } catch (e) {
      return jsonResponse(ctx, 400, {message: 'Problems parsing JSON'});
    }
    if (!createRequest.files || Object.keys(createRequest.files).length === 0) {
      return jsonResponse(ctx, 422, {message: 'Invalid files'});
    }

    for (const [filename, file] of Object.entries(createRequest.files)) {
      file.filename = filename;
    }
    const gist = {
      id: `fake-gist-${randomNumber()}`,
      files: createRequest.files,
      owner: {id: userAndScope.userId},
    };
    this._gists.set(gist.id, gist);
    return jsonResponse(ctx, 200, gist);
  }
}
