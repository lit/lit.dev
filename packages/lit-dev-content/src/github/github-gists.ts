/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {JSON_GITHUB_API_V3, fetchGitHubJson} from './github-util.js';

import type {
  GitHubApiOptions,
  AuthenticatedGitHubApiOptions,
} from './github-types.js';

export interface Gist {
  id: string;
  files: GistFiles;
  owner: {
    id: number;
  };
}

export type GistFiles = {[filename: string]: GistFile};

export interface GistFile {
  filename?: string;
  content: string;
}

/**
 * Get an existing GitHub gist.
 */
export const getGist = async (
  gistId: string,
  opts: GitHubApiOptions
): Promise<Gist> => {
  // https://docs.github.com/en/rest/reference/gists#get-a-gist
  const url = new URL(`/gists/${gistId}`, opts.apiBaseUrl);
  return fetchGitHubJson<Gist>(url, {
    headers: {
      accept: JSON_GITHUB_API_V3,
    },
  });
};

/**
 * Create a new GitHub gist from the given files and return its id.
 */
export const createGist = async (
  files: GistFiles,
  opts: AuthenticatedGitHubApiOptions
): Promise<Gist> => {
  // https://docs.github.com/en/rest/reference/gists#create-a-gist
  const url = new URL('/gists', opts.apiBaseUrl);
  return fetchGitHubJson<Gist>(url, {
    method: 'POST',
    headers: {
      accept: JSON_GITHUB_API_V3,
      authorization: `token ${opts.token}`,
    },
    body: JSON.stringify({files}),
  });
};

/**
 * Create a new revision of an existing GitHub gist.
 */
export const updateGist = async (
  gistId: string,
  files: GistFiles,
  opts: AuthenticatedGitHubApiOptions
): Promise<Gist> => {
  // https://docs.github.com/en/rest/reference/gists#update-a-gist
  const url = new URL(`/gists/${gistId}`, opts.apiBaseUrl);
  return fetchGitHubJson<Gist>(url, {
    method: 'PATCH',
    headers: {
      accept: JSON_GITHUB_API_V3,
      authorization: `token ${opts.token}`,
    },
    body: JSON.stringify({
      gist_id: gistId,
      files,
    }),
  });
};
