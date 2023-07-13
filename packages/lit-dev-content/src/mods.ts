/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const BASE_URL = new URL(window.location.href);
export const MODS = BASE_URL.searchParams.get('mods');

export const addModsParameterToUrlIfNeeded = (url: string): string => {
  if (MODS) {
    const urlObj = new URL(url, BASE_URL);
    if (urlObj.origin === BASE_URL.origin) {
      urlObj.searchParams.set('mods', MODS);
      return urlObj.href;
    }
  }
  return url;
};

export const modEnabled = (mod: string): boolean =>
  MODS !== null && MODS.split(' ').includes(mod);
