/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import fetch from 'node-fetch';

import type koa from 'koa';
import type {Response} from 'node-fetch';

/**
 * Options for createGitHubTokenExchangeMiddleware.
 */
export interface GitHubTokenExchangeMiddlewareOptions {
  /**
   * The URL of GitHub. The official URL is https://github.com/, but a different
   * URL can be passed here for testing.
   */
  githubMainUrl: string;

  /**
   * GitHub OAuth app client ID.
   *
   * This is public information.
   */
  clientId: string;

  /**
   * GitHub OAuth app secret key.
   *
   * This is very secret, because it would allow anybody to impersonate our
   * GitHub app.
   */
  clientSecret: string;
}

const safelyGetHttpBody = async (resp: Response): Promise<string> => {
  try {
    return await resp.text();
  } catch (error) {
    return `Error: ${(error as Error).toString()}`;
  }
};

/**
 * Create a Koa middleware that exchanges a temporary user GitHub OAuth
 * authorization code for a long-term GitHub API access token.
 *
 * This process is described in Step 2 of
 * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
 *
 * The reason this step can't happen in the browser is that it requires
 * authenticating as our GitHub OAuth app, which requires a secret that cannot
 * be sent to the browser, because that would reveal it to the public and allow
 * third parties to impersonate our app.
 */
export const createGitHubTokenExchangeMiddleware =
  ({
    githubMainUrl,
    clientId,
    clientSecret,
  }: GitHubTokenExchangeMiddlewareOptions): koa.Middleware =>
  async (ctx, next) => {
    if (ctx.path !== '/api/github-token-exchange') {
      return next();
    }

    const errorResponse = (
      status: number,
      externalMessage: string,
      internalMessage?: string
    ): void => {
      ctx.status = status;
      ctx.type = 'application/json';
      // Let's not directly write anything we get from GitHub directly to our
      // public responses, apart from the access token in a successful response,
      // just in case for some crazy reason the response includes our secret.
      ctx.body = JSON.stringify({error: externalMessage});
      console.error(
        `GitHub token exchange middleware error [${status}]\n${externalMessage}${
          internalMessage ? '\n' + internalMessage : ''
        }`
      );
    };

    const request = ctx.query as {code?: string};
    const code = request.code;
    if (!code) {
      return errorResponse(
        400,
        'The "code" query parameter is missing or malformed.'
      );
    }

    const tokenFetchUrl = new URL('/login/oauth/access_token', githubMainUrl);
    tokenFetchUrl.searchParams.set('code', code);
    tokenFetchUrl.searchParams.set('client_id', clientId);
    tokenFetchUrl.searchParams.set('client_secret', clientSecret);
    const tokenFetchOpts = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };
    const tokenHttpResp = await fetch(tokenFetchUrl.href, tokenFetchOpts);
    if (!tokenHttpResp.ok) {
      return errorResponse(
        500,
        `An HTTP ${tokenHttpResp.status} error was returned by the GitHub API.`,
        await safelyGetHttpBody(tokenHttpResp)
      );
    }

    let tokenResp: {
      error?: string;
      access_token?: string;
      refresh_token?: string;
    };
    try {
      tokenResp = (await tokenHttpResp.json()) as typeof tokenResp;
    } catch (error) {
      return errorResponse(
        500,
        'Error parsing JSON response from GitHub API.',
        (error as Error).message
      );
    }

    if (tokenResp.error) {
      if (tokenResp.error === 'bad_verification_code') {
        // This error could happen if a client bug corrupts the code, or waits
        // too long before sending it (10 minutes).
        return errorResponse(
          401,
          'The code passed is incorrect or expired.',
          JSON.stringify(tokenResp)
        );
      } else if (tokenResp.error === 'incorrect_client_credentials') {
        // This error could happen if our GitHub app ID or secret is set
        // incorrectly or has been rotated but not updated.
        return errorResponse(
          500,
          'The GitHub client credentials are invalid.',
          JSON.stringify(tokenResp)
        );
      }
      return errorResponse(
        500,
        'An unexpected GitHub API error occured.',
        JSON.stringify(tokenResp)
      );
    }

    const accessToken = tokenResp.access_token;
    if (!accessToken) {
      return errorResponse(
        500,
        'Unexpected GitHub API response format.',
        JSON.stringify(tokenResp)
      );
    }

    ctx.status = 200;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({accessToken});
  };
