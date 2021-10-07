/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {GitHubSigninReceiverMessage} from './github-types.js';

// This is the inlined script for the /playground/signin/ page.
//
// This page is assumed to be running in a popup window created by the main
// Playground page. After the user clicks "Accept" or "Cancel" on the GitHub
// authorization page, GitHub will redirect to this page with a "code" or
// "error" URL parameter. This page will then message the original parent
// Playground window with that code or error, and the popup window will close.

const opener = window.opener as Window | null;
if (opener) {
  const url = new URL(document.location.href);
  const params = url.searchParams;
  const code = params.get('code');
  const error = params.get('error');
  let message: GitHubSigninReceiverMessage;
  if (error) {
    message = {error};
  } else if (!code) {
    message = {error: 'No code'};
  } else {
    message = {code};
  }
  opener.postMessage(message);
} else {
  const p = document.createElement('p');
  p.textContent = `Oops! Something went wrong while signing into GitHub.
The Playground tab that opened this window could not be found.`;
  document.body.appendChild(p);
}
