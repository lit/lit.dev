/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitDevError} from '../errors.js';

import type {GitHubSigninReceiverMessage} from './github-types.js';

/**
 * Options for signInToGithub.
 */
export interface GitHubSigninOptions {
  /**
   * GitHub OAuth App client ID. Generated when a GitHub OAuth App is first
   * created.
   */
  clientId: string;

  /**
   * URL where users will be redirected to authorize with GitHub.
   */
  authorizeUrl: string;
}

/**
 * Pop open a window to authenticate the current user with GitHub following the
 * procedure documented at
 * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow.
 */
export const signInToGithub = async (
  options: GitHubSigninOptions
): Promise<string> => {
  const url = new URL(options.authorizeUrl);
  url.searchParams.set('client_id', options.clientId);
  url.searchParams.set('scope', 'gist');
  url.searchParams.set(
    'redirect_uri',
    new URL('/playground/signin/', document.location.href).href
  );

  // Width and height found empirically.
  const width = 600;
  const height = 650;
  // Position the popup in the middle of this tab.
  const top = window.screenY + window.outerHeight / 2 - height / 2;
  const left = window.screenX + window.outerWidth / 2 - width / 2;
  const popup = window.open(
    url,
    '_blank',
    `width=${width},height=${height},top=${top},left=${left}`
  );
  if (popup === null) {
    // Disabling popups in Chrome and Firefox doesn't seem to prevent
    // window.open from working here, so it's unclear when this can actually
    // occur.
    throw new LitDevError({
      heading: 'Could not open GitHub window',
      message:
        "We couldn't open the window that's required for signing in to" +
        ' GitHub. You may need to enable popups in your browser settings.',
    });
  }

  const closePopupIfParentCloses = () => popup.close();
  window.addEventListener('beforeunload', closePopupIfParentCloses);

  const pendingCode = receiveCodeFromPopup(popup);
  const codeOrClosed = await Promise.race([
    pendingCode.promise,
    pollForPopupClosed(popup, 250),
  ]);
  window.removeEventListener('beforeunload', closePopupIfParentCloses);
  if (codeOrClosed === 'closed') {
    pendingCode.abort();
    throw new LitDevError({
      heading: 'GitHub window closed',
      message:
        'It looks like you closed the GitHub window. If you still' +
        " want to create a GitHub gist, you'll need to click " +
        '"Authorize lit" when prompted by the popup window.',
    });
  }
  popup.close();
  const code = codeOrClosed;
  if (code.error !== undefined) {
    if (code.error === 'access_denied') {
      throw new LitDevError({
        heading: 'GitHub authorization declined',
        message:
          'It looks like you clicked the "Cancel" button. If you still' +
          " want to create a GitHub gist, you'll need to click " +
          '"Authorize lit" when prompted by the popup window.',
      });
    }
    throw new LitDevError({
      heading: 'Unknown GitHub authorization error',
      message:
        'Sorry! An unknown error occured while authorizing with' +
        ` GitHub. The following code is all we know: ${code.error}`,
    });
  }
  return exchangeCodeForAccessToken(code.code);
};

/**
 * Listen for a postMessage from the popup window containing the temporary
 * GitHub authentication code or an error. Also returns an abort function which
 * can be used to clean up this event listener if we need to end early.
 */
const receiveCodeFromPopup = (
  popup: Window
): {
  promise: Promise<GitHubSigninReceiverMessage>;
  abort: () => void;
} => {
  const abortController = new AbortController();
  const abort = () => abortController.abort();
  const promise = new Promise<GitHubSigninReceiverMessage>((resolve) => {
    window.addEventListener(
      'message',
      (event) => {
        // Note we must check source because our popup might not be the only
        // source of "message" events. This is also why we can't set "once". We
        // also check the origin because we expect GitHub to redirect to the
        // receiver page running on the same origin as this page; any other
        // origin would be suspicious (or a misconfiguration).
        if (event.source === popup && event.origin === window.location.origin) {
          resolve(event.data);
          abort();
        }
      },
      {signal: abortController.signal}
    );
  });
  return {promise, abort};
};

/**
 * Return a promise that resolves when the given window is closed. Since there
 * is no event to indicate this, unfortunately we must poll.
 */
const pollForPopupClosed = (
  popup: Window,
  pollInterval: number
): Promise<'closed'> => {
  return new Promise((resolve) => {
    const id = setInterval(() => {
      if (popup.closed) {
        resolve('closed');
        clearInterval(id);
      }
    }, pollInterval);
  });
};

/**
 * Response from /api/github-token-exchange
 */
export type GitHubTokenExchangeApiResponse =
  | {accessToken: string; error?: undefined}
  | {accessToken?: undefined; error: string};

/**
 * Exchange a temporary code for a long term access token.
 */
const exchangeCodeForAccessToken = async (code: string): Promise<string> => {
  const url = new URL('/api/github-token-exchange', document.location.href);
  url.searchParams.set('code', code);
  const httpResp = await fetch(url.href, {method: 'POST'});
  const jsonResp = (await httpResp.json()) as GitHubTokenExchangeApiResponse;
  if (jsonResp.error !== undefined || !httpResp.ok) {
    throw new Error(
      `/api/github-token-exchange error [${httpResp.status}]: ${
        jsonResp.error ?? '<unknown>'
      }`
    );
  }
  return jsonResp.accessToken;
};
