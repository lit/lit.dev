/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Specifies the GitHub API version we expect.
 */
export const JSON_GITHUB_API_V3 = 'application/vnd.github.v3+json';

/**
 * An error encountered while querying the GitHub API.
 */
export class GitHubError extends Error {
  readonly url: URL;
  readonly status?: number;

  constructor(
    url: URL,
    method: string,
    status: number | undefined,
    message?: string,
    stack?: string
  ) {
    super(
      `Error calling GitHub API ${method} ${url.pathname}` +
        (status ? ` (HTTP status ${status})` : '') +
        (message ? `: ${message}` : '')
    );
    this.url = url;
    this.status = status;
    if (stack) {
      this.stack = stack;
    }
  }
}

/**
 * Perform a fetch and return the JSON response. Throw on non-2XX HTTP status
 * codes. Wrap all exceptions in the GitHubError class.
 */
export const fetchGitHubJson = async <T>(
  url: URL,
  init: RequestInit
): Promise<T> => {
  try {
    const res = await fetch(url.href, init);
    if (!res.ok) {
      throw new GitHubError(url, init?.method ?? 'GET', res.status);
    }
    // Await so that we catch errors.
    return await res.json();
  } catch (error: unknown) {
    if (!(error instanceof GitHubError)) {
      error = new GitHubError(
        url,
        init?.method ?? 'GET',
        undefined,
        (error as Error).message,
        (error as Error).stack
      );
    }
    throw error;
  }
};
