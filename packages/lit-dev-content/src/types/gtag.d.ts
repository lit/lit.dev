/**
 * @license
 * Copyright The Lit Project
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
interface Window {
  gtag?: (
    interface: 'event',
    eventName: string,
    params?: {[param: string]: unknown}
  ) => void;
}
