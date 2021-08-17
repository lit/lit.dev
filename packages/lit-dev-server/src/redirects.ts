/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Any redirects here to an external domain need to be added as exclusions in
 * the `check-links:external` test in the root `package.json`. Otherwise the
 * test queues these external domains for broken link checking crawling those
 * domains and timing out the test.
 */
export const pageRedirects  = new Map(
  [
    ['/slack-invite/', 'https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw'],
  ]
)
