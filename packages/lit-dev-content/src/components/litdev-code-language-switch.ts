/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, customElement} from 'lit-element';
import {
  getCodeLanguagePreference,
  setCodeLanguagePreference,
  CODE_LANGUAGE_PREFERENCE_EVENT_NAME,
  CodeLanguagePreference,
} from '../code-language-preference.js';

/**
 * A switch that toggles between TypeScript and JavaScript preferences.
 *
 * When changed, the preference is saved to localStorage. If the preference is
 * updated anywhere on the page, every instance of this switch will
 * automatically update to reflect it.
 */
@customElement('litdev-code-language-switch')
export class LitDevCodeLanguageSwitch extends LitElement {
  static override styles = css`
    :host {
      /* TODO(aomarks) Fix as inline-flex after jsSamples mod is retired. */
      display: var(--litdev-code-language-switch-display, none);
      font-family: 'Open Sans', sans-serif;
    }

    button {
      display: flex;
      font-family: inherit;
      font-weight: inherit;
      color: black;
      background: #fbfcff;
      padding: 2px 14px;
      border: 1.5px solid #8e9498;
      transition: background-color 100ms;
      width: 40px;
      justify-content: center;
    }

    /* Note [disabled] implies selected, because the active choice is always
    disabled.*/
    button[disabled],
    button:hover {
      background: #ebeeff;
      border-color: #7589ff;
    }

    button:not([disabled]) {
      cursor: pointer;
    }

    button:first-of-type {
      border-radius: 15px 0 0 15px;
    }

    button:last-of-type {
      border-radius: 0 15px 15px 0;
      border-left-color: #8e9498;
    }

    button:not(:last-of-type) {
      border-right: none;
    }
  `;

  override connectedCallback() {
    // TODO(aomarks) After we upgrade to Lit 2, this and similar code in other
    // components could be refactored into a controller.
    super.connectedCallback();
    window.addEventListener(
      CODE_LANGUAGE_PREFERENCE_EVENT_NAME,
      this._onCodeLanguagePreferenceChanged
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      CODE_LANGUAGE_PREFERENCE_EVENT_NAME,
      this._onCodeLanguagePreferenceChanged
    );
  }

  private _onCodeLanguagePreferenceChanged = () => {
    this.requestUpdate();
  };

  override render() {
    const mode = getCodeLanguagePreference();
    return html`
      <button
        title="Display code as JavaScript"
        aria-label="Display code as JavaScript"
        ?disabled=${mode === 'js'}
        @click=${this._onClickJs}
      >
        JS
      </button>

      <button
        title="Display code as TypeScript"
        aria-label="Display code as TypeScript"
        ?disabled=${mode === 'ts'}
        @click=${this._onClickTs}
      >
        TS
      </button>
    `;
  }

  private _onClickJs() {
    this._changeLanguageAndAdjustScroll('js');
  }

  private _onClickTs() {
    this._changeLanguageAndAdjustScroll('ts');
  }

  /**
   * Set the language preference and re-scroll the window so that this button
   * remains in the same position relative to the viewport.
   *
   * Code samples commonly have a different number of lines in TypeScript vs
   * JavaScript. This can cause page layout shifts when the language changes,
   * especially because changing the language for one sample changes it for all
   * other samples on the page too. These shifts are very visually distracting,
   * and can even cause the active code sample to move entirely out of view.
   *
   * We mitigate this by comparing the viewport-relative position of this
   * particular instance of the language switch before and after the change, and
   * re-scrolling the window so it remains in the same visual location.
   */
  private _changeLanguageAndAdjustScroll(language: CodeLanguagePreference) {
    const viewportYBefore = this.getBoundingClientRect().y;
    setCodeLanguagePreference(language);
    const viewportYAfter = this.getBoundingClientRect().y;
    window.scrollBy({top: viewportYAfter - viewportYBefore});
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-code-language-switch': LitDevCodeLanguageSwitch;
  }
}
