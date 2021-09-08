/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

type TypeScriptPreference = 'ts' | 'js';

const LOCAL_STORAGE_KEY = 'typescript-preference';

/**
 * Name of the event that is fired on window whenever the global user TypeScript
 * preference changes.
 */
export const TYPESCRIPT_PREFERENCE_EVENT_NAME = 'typescript-preference-changed';

/**
 * Get the user's TypeScript vs JavaScript preference from localStorage.
 * Defaults to TypeScript if there is no preference.
 */
export const getTypeScriptPreference = (): TypeScriptPreference =>
  (localStorage.getItem(LOCAL_STORAGE_KEY) as TypeScriptPreference | null) ??
  'ts';

/**
 * Save the user's TypeScript vs JavaScript preference to localStorage, and fire
 * a change event on window.
 */
export const setTypeScriptPreference = (
  preference: TypeScriptPreference
): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, preference);
  window.dispatchEvent(new Event(TYPESCRIPT_PREFERENCE_EVENT_NAME));
};
