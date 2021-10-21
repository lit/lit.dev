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
  let failNextRequest = false;
  return async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    if (ctx.method === 'OPTIONS') {
      // CORS preflight
      ctx.status = 204;
      ctx.set('Access-Control-Allow-Headers', 'Authorization');
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PATCH');
      return;
    } else if (ctx.path === '/favicon.ico') {
      // Don't count this automatic request when failing intentionally.
      return next();
    } else if (ctx.path === '/fail-next-request') {
      failNextRequest = true;
      ctx.status = 200;
      ctx.body = 'Next request will fail';
      return;
    } else if (failNextRequest) {
      ctx.status = 500;
      ctx.body = 'Failed intentionally';
      failNextRequest = false;
      return;
    } else if (ctx.path === '/reset') {
      failNextRequest = false;
      return fake.reset(ctx);
    } else if (ctx.path === '/login/oauth/authorize') {
      return fake.authorize(ctx);
    } else if (ctx.path === '/login/oauth/access_token') {
      return fake.accessToken(ctx);
    } else if (ctx.path === '/user' && ctx.method === 'GET') {
      return fake.getUser(ctx);
    } else if (ctx.path.startsWith('/u/') && ctx.method === 'GET') {
      return fake.getAvatarImage(ctx);
    } else if (ctx.path === '/gists' && ctx.method === 'POST') {
      return fake.createGist(ctx);
    } else if (ctx.path.startsWith('/gists/') && ctx.method === 'GET') {
      return fake.getGist(ctx);
    } else if (ctx.path.startsWith('/gists/') && ctx.method === 'PATCH') {
      return fake.updateGist(ctx);
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

interface UpdateGistRequest {
  files: {[filename: string]: GistFile};
}

interface GetGistResponse {
  id: string;
  files: {[filename: string]: GistFile};
  owner: {id: number};
}

interface UserDetails {
  login: string;
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
  private readonly _userDetails = new Map<number, UserDetails>();

  constructor(options: FakeGitHubMiddlewareOptions) {
    this._options = options;
  }

  /**
   * Generate a random user ID for this session and persist it in a cookie.
   */
  private _getOrSetUserIdFromCookie(ctx: Koa.Context): number {
    let userIdStr = ctx.cookies.get('userid');
    let userId = userIdStr ? Number(userIdStr) : undefined;
    if (
      userId === undefined ||
      // The server must have restarted, so this is an invalid user id now.
      !this._userDetails.has(userId)
    ) {
      userId = randomNumber();
      this._userDetails.set(userId, {
        login: 'fakeuser',
      });
      ctx.cookies.set('userid', String(userId));
    }
    return userId;
  }

  private _checkAccept(ctx: Koa.Context): boolean {
    const accept = ctx.get('accept');
    if (accept !== 'application/vnd.github.v3+json') {
      jsonResponse(ctx, 415, {
        message: "Unsupported 'Accept' header",
      });
      return false;
    }
    return true;
  }

  private _checkAuthentication(ctx: Koa.Context): UserAndScope | undefined {
    const match = (ctx.get('authorization') ?? '').match(
      /^\s*(?:token|bearer)\s(?<token>.+)$/
    );
    const token = match?.groups?.token?.trim() ?? '';
    const userAndScope = this._accessTokens.get(token);
    if (!userAndScope) {
      jsonResponse(ctx, 401, {message: 'Bad credentials'});
      return undefined;
    }
    return userAndScope;
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
    this._userDetails.clear();
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
   * Simulates get https://api.github.com/user, the API for getting details
   * about the authenticated user.
   */
  async getUser(ctx: Koa.Context) {
    if (!this._checkAccept(ctx)) {
      return;
    }
    const userAndScope = this._checkAuthentication(ctx);
    if (!userAndScope) {
      return;
    }
    const {userId} = userAndScope;
    const details = this._userDetails.get(userId);
    if (!details) {
      return jsonResponse(ctx, 500, {message: 'Missing user details'});
    }
    return jsonResponse(ctx, 200, {
      id: userId,
      login: details.login,
    });
  }

  /**
   * Simulates https://avatars.githubusercontent.com/u/<numeric user id>, the
   * endpoint that serves GitHub avatar images.
   */
  async getAvatarImage(ctx: Koa.Context) {
    const id = ctx.path.match(/^\/u\/(?<id>\d+)/)?.groups?.id;
    ctx.status = 200;
    ctx.type = 'image/svg+xml';
    const size = parseInt((ctx.query.s as string | undefined) ?? '245', 10);
    const widthHeight = `width="${size}" height="${size}"`;
    if (id && this._userDetails.has(Number(id))) {
      // Yellow smiley
      ctx.body = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 100 100" ${widthHeight}>
        <circle cx="50" cy="50" r="50" fill="#fd0" />
        <circle cx="30" cy="40" r="10" fill="#000" />
        <circle cx="70" cy="40" r="10" fill="#000" />
        <path d="M20,65 c15,15 45,15 60,0"
              style="fill:none;stroke:#000;stroke-width:5" />
      </svg>
      `;
    } else {
      // Red cross
      ctx.body = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 100 100" ${widthHeight}>
        <path d="M5,5 L95,95 M5,95 L95,5"
              style="fill:none;stroke:#f00;stroke-width:15" />
      </svg>
      `;
    }
  }

  /**
   * Simulates GET https://api.github.com/gists/<id>, the API for getting a
   * GitHub gist.
   *
   * Documentation:
   * https://docs.github.com/en/rest/reference/gists#get-a-gist
   */
  async getGist(ctx: Koa.Context) {
    if (!this._checkAccept(ctx)) {
      return;
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
    // Gist files are always sorted alphabetically regardless of the order
    // given.
    gist.files = Object.fromEntries(
      Object.entries(gist.files).sort(([aName], [bName]) =>
        aName.localeCompare(bName)
      )
    );
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
    if (!this._checkAccept(ctx)) {
      return;
    }
    const userAndScope = this._checkAuthentication(ctx);
    if (!userAndScope) {
      return;
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
      if (!file.content) {
        // Empty files are not allowed.
        return jsonResponse(ctx, 422, {message: 'Validation Failed'});
      }
      file.filename = filename;
    }
    const gist = {
      id: `fake-gist-${randomNumber()}`,
      files: createRequest.files,
      owner: {id: userAndScope.userId},
    };
    this._gists.set(gist.id, gist);
    // Add a similar latency to the real API.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return jsonResponse(ctx, 200, gist);
  }

  /**
   * Simulates PATCH https://api.github.com/gists/<id>, the API for creating a
   * new revision of an existing GitHub gist.
   *
   * Documentation:
   * https://docs.github.com/en/rest/reference/gists#update-a-gist
   */
  async updateGist(ctx: Koa.Context) {
    if (!this._checkAccept(ctx)) {
      return;
    }
    const userAndScope = this._checkAuthentication(ctx);
    if (!userAndScope) {
      return;
    }

    const idMatch = ctx.path.match(/^\/gists\/(?<id>.+)/);
    const id = idMatch?.groups?.id;
    const gist = this._gists.get(id ?? '');
    if (!gist) {
      // TODO(aomarks) Check error code
      return jsonResponse(ctx, 404, {message: 'Invalid gist'});
    }

    let updateRequest: UpdateGistRequest;
    try {
      updateRequest = await coBody.json(ctx);
    } catch (e) {
      return jsonResponse(ctx, 400, {message: 'Problems parsing JSON'});
    }
    if (!updateRequest.files || Object.keys(updateRequest.files).length === 0) {
      return jsonResponse(ctx, 422, {message: 'Invalid files'});
    }

    // TODO(aomarks) In the real API, each revision is stored individually, and
    // you can GET either the latest revision, or a specific revision. Until
    // needed, though, this fake just directly updates the simplified flat gist
    // instead.
    const newFiles = updateRequest.files;
    const oldFiles = gist.files;
    for (const [newFilename, newFile] of Object.entries(newFiles)) {
      newFile.filename = newFilename;
      if (!newFile.content && oldFiles[newFilename] === undefined) {
        // New empty files are not allowed.
        return jsonResponse(ctx, 422, {message: 'Validation Failed'});
      }
    }
    for (const [oldFilename, oldFile] of Object.entries(oldFiles)) {
      // To delete a file, you set its content to an empty string or undefined.
      // If entirely omitted, the existing file is unchanged. See
      // https://github.community/t/deleting-or-renaming-files-in-a-multi-file-gist-using-github-api/170967
      if (newFiles[oldFilename] === undefined) {
        newFiles[oldFilename] = oldFile;
      } else if (!newFiles[oldFilename]?.content) {
        delete newFiles[oldFilename];
      }
    }
    gist.files = newFiles;

    // Add a similar latency to the real API.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return jsonResponse(ctx, 200, gist);
  }
}
