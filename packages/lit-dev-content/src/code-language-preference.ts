/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

export type CodeLanguagePreference = 'ts' | 'js';

const LOCAL_STORAGE_KEY = 'code-language-preference';

const BODY_ATTRIBUTE = 'code-language-preference';

/**
 * Name of the event that is fired on window whenever the global user TypeScript
 * preference changes.
 */
export const CODE_LANGUAGE_CHANGE = 'code-language-change';

/**
 * Name of the event that is fired on window before the global user code
 * language changes, providing an opportunity to cancel it.
 */
export const BEFORE_CODE_LANGUAGE_CHANGE = 'before-code-language-change';

/**
 * Details of the before-code-language-change event.
 */
interface BeforeCodeLanguageChangeDetail {
  /**
   * The new language that will be changed to.
   */
  pendingLanguage: CodeLanguagePreference;

  /**
   * If this function is called, this language change will be aborted.
   */
  cancel: () => void;
}

declare global {
  interface WindowEventMap {
    [BEFORE_CODE_LANGUAGE_CHANGE]: CustomEvent<BeforeCodeLanguageChangeDetail>;
  }
}

/**
 * Get the user's TypeScript vs JavaScript preference from localStorage.
 * Defaults to TypeScript if there is no preference.
 */
export const getCodeLanguagePreference = (): CodeLanguagePreference =>
  (localStorage.getItem(LOCAL_STORAGE_KEY) as CodeLanguagePreference | null) ??
  'ts';

/**
 * Save the user's TypeScript vs JavaScript preference.
 *
 * Unless `force` is true, a "before-code-language-change" event is first fired
 * on window, which gives playgrounds an opportunity to cancel the preference
 * change in case they have unsaved changes.
 *
 * If no handlers cancel the change, or if `force` is true, then the preference
 * is written to local storage, a "code-language-change" event is fired on
 * window, and an HTML attribute is written to the body.
 */
export const setCodeLanguagePreference = (
  preference: CodeLanguagePreference,
  force = false
): void => {
  if (!force) {
    let cancelled = false;
    const detail: BeforeCodeLanguageChangeDetail = {
      pendingLanguage: preference,
      cancel: () => {
        cancelled = true;
      },
    };
    window.dispatchEvent(
      new CustomEvent(BEFORE_CODE_LANGUAGE_CHANGE, {detail})
    );
    if (cancelled) {
      return;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, preference);
  window.dispatchEvent(new Event(CODE_LANGUAGE_CHANGE));
  writeCodeLanguagePreferenceBodyAttribute();
};

/**
 * Write the user's current TypeScript vs JavaScript preference to an HTML
 * attribute on body.
 */
export const writeCodeLanguagePreferenceBodyAttribute = () => {
  document.body.setAttribute(BODY_ATTRIBUTE, getCodeLanguagePreference());
};
