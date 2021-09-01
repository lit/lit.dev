/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// prettier-ignore
export const pageRedirects = new Map([
  ['/slack-invite', 'https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw'],
].map(([path, redir]) => [
  // Trailing slashes are required because this redirect map is consulted after
  // standard lit.dev path canonicalization.
  path.match(/\/[^\/\.]+$/) ? path + '/' : path,
  redir,
]));
