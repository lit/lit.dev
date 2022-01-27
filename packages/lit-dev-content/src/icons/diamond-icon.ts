/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html} from 'lit';

export const diamondIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 3 3"
>
  <rect
    style="fill:var(--diamond-icon-color, #324fff);"
    width="2"
    height="2"
    x="1"
    y="-1"
    transform="rotate(45)"
  />
</svg>`;
