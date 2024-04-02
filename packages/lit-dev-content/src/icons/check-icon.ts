/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html, nothing} from 'lit';

// Source: https://fonts.google.com/icons?selected=Material+Icons+Outlined:check_circle
export const checkIcon = (slot = '') => html`<svg
  height="24px"
  viewBox="0 0 24 24"
  width="24px"
  fill="currentcolor"
  slot=${slot || nothing}
>
  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
</svg>`;
