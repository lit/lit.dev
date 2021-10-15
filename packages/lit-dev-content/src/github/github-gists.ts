/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {JSON_GITHUB_API_V3} from './github-util.js';

import type {
  GitHubApiOptions,
  AuthenticatedGitHubApiOptions,
} from './github-types.js';

export interface Gist {
  id: string;
  files: GistFiles;
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
  const url = new URL(`/gists/${gistId}`, opts.apiBaseUrl).href;
  const res = await fetch(url, {
    headers: {
      accept: JSON_GITHUB_API_V3,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} error getting gist ${gistId}`);
  }
  return res.json() as Promise<Gist>;
};

/**
 * Create a new GitHub gist from the given files and return its id.
 */
export const createGist = async (
  files: GistFiles,
  opts: AuthenticatedGitHubApiOptions
): Promise<string> => {
  // https://docs.github.com/en/rest/reference/gists#create-a-gist
  const url = new URL('/gists', opts.apiBaseUrl).href;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      accept: JSON_GITHUB_API_V3,
      authorization: `token ${opts.token}`,
    },
    body: JSON.stringify({files}),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} error creating gist`);
  }
  const gist = (await res.json()) as Gist;
  return gist.id;
};

/**
 * Create a new revision of an existing GitHub gist.
 */
export const updateGist = async (
  gistId: string,
  files: GistFiles,
  opts: AuthenticatedGitHubApiOptions
): Promise<Gist> => {
  // Create a new revision of an existing GitHub gist.
  const url = new URL(`/gists/${gistId}`, opts.apiBaseUrl).href;
  const res = await fetch(url, {
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
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} error updating gist`);
  }
  return res.json() as Promise<Gist>;
};
