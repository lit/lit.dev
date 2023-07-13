/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {JSON_GITHUB_API_V3, fetchGitHubJson} from './github-util.js';

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
  const url = new URL('/user', opts.apiBaseUrl);
  return fetchGitHubJson<UserInfo>(url, {
    headers: {
      accept: JSON_GITHUB_API_V3,
      authorization: `token ${opts.token}`,
    },
  });
};
