/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {JSON_GITHUB_API_V3} from './github-util.js';

import type {AuthenticatedGitHubApiOptions} from './github-types.js';

export interface UserInfo {
  id: number;
  login: string;
}

/**
 * Get details about the authenticated user.
 */
export const getAuthenticatedUser = async (
  opts: AuthenticatedGitHubApiOptions
): Promise<UserInfo> => {
  // https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
  const url = new URL('/user', opts.apiBaseUrl).href;
  const res = await fetch(url, {
    headers: {
      accept: JSON_GITHUB_API_V3,
      authorization: `token ${opts.token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} error getting authenticated user info`);
  }
  return res.json() as Promise<UserInfo>;
};
