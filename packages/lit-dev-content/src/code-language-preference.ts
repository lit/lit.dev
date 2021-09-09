/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

type CodeLanguagePreference = 'ts' | 'js';

const LOCAL_STORAGE_KEY = 'code-language-preference';

const BODY_ATTRIBUTE = 'code-language-preference';

/**
 * Name of the event that is fired on window whenever the global user TypeScript
 * preference changes.
 */
export const CODE_LANGUAGE_PREFERENCE_EVENT_NAME =
  'code-language-preference-changed';

/**
 * Get the user's TypeScript vs JavaScript preference from localStorage.
 * Defaults to TypeScript if there is no preference.
 */
export const getCodeLanguagePreference = (): CodeLanguagePreference =>
  (localStorage.getItem(LOCAL_STORAGE_KEY) as CodeLanguagePreference | null) ??
  'ts';

/**
 * Save the user's TypeScript vs JavaScript preference to localStorage, and fire
 * a change event on window.
 */
export const setCodeLanguagePreference = (
  preference: CodeLanguagePreference
): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, preference);
  window.dispatchEvent(new Event(CODE_LANGUAGE_PREFERENCE_EVENT_NAME));
  writeCodeLanguagePreferenceBodyAttribute();
};

/**
 * Write the user's current TypeScript vs JavaScript preference to an HTML
 * attribute on body.
 */
export const writeCodeLanguagePreferenceBodyAttribute = () => {
  document.body.setAttribute(BODY_ATTRIBUTE, getCodeLanguagePreference());
};
