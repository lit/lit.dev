/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

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
): Promise<GitHubSigninReceiverMessage> => {
  const url = new URL(options.authorizeUrl);
  url.searchParams.set('client_id', options.clientId);
  url.searchParams.set('scope', 'gist');
  url.searchParams.set(
    'redirect_uri',
    new URL('/playground/signin/', document.location.href).href
  );
  // Width and height found by empirically.
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
    throw new Error('Could not open window. Are popups disabled?');
  }
  const result = await new Promise<GitHubSigninReceiverMessage>((resolve) => {
    const listener = (event: MessageEvent<GitHubSigninReceiverMessage>) => {
      if (event.source === popup) {
        resolve(event.data);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  });
  popup.close();
  return result;
};
