/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {
  getCodeLanguagePreference,
  setCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
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
    :host,
    * {
      box-sizing: border-box;
    }

    :host {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      width: calc(48em / 13);
      height: calc(27em / 13);
      border-radius: 1em;
      padding: calc(2em / 13);
      border: calc(1.5em / 13) solid #ccc;
      background: white;
      font-family: 'Open Sans', sans-serif;
    }

    button {
      flex: 1;
      height: 100%;
      display: flex;
      position: relative;
      font-size: inherit;
      font-family: inherit;
      background: transparent;
      border: none;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      padding: 0;
      z-index: 0;
    }

    #toggle {
      position: absolute;
      width: 50%;
      height: 100%;
      top: 0;
      transition: left 100ms;
      background: #767676;
      z-index: -1;
      border-radius: 1em;
    }

    @media (prefers-reduced-motion: reduce) {
      #toggle {
        transition: none;
      }
    }

    button:hover > #toggle {
      background: #005cc5bd;
    }

    [aria-checked='false'] > #toggle {
      left: 0;
    }

    [aria-checked='true'] > #toggle {
      left: 50%;
    }

    #jsLabel,
    #tsLabel {
      display: inline-flex;
      z-index: 1;
      padding: 0 0 calc(1em / 13) calc(3em / 13);
      opacity: 60%;
      transition: color 100ms, opacity 100ms;
    }

    [aria-checked='true'] > #tsLabel,
    [aria-checked='false'] > #jsLabel {
      color: white;
      font-weight: 600;
      opacity: 100%;
    }
  `;

  override connectedCallback() {
    // TODO(aomarks) After we upgrade to Lit 2, this and similar code in other
    // components could be refactored into a controller.
    super.connectedCallback();
    window.addEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      CODE_LANGUAGE_CHANGE,
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
        role="switch"
        aria-checked=${mode == 'ts' ? 'true' : 'false'}
        aria-label="Toggle TypeScript"
        title=${mode === 'ts' ? 'Disable TypeScript' : 'Enable TypeScript'}
        @click=${this._toggleLanguageAndAdjustScroll}
      >
        <span id="jsLabel" aria-hidden="true">JS</span>
        <span id="tsLabel" aria-hidden="true">TS</span>
        <span id="toggle"></span>
      </button>
    `;
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
  private _toggleLanguageAndAdjustScroll() {
    const newLanguage = getCodeLanguagePreference() === 'ts' ? 'js' : 'ts';
    const viewportYBefore = this.getBoundingClientRect().y;
    setCodeLanguagePreference(newLanguage);
    const viewportYAfter = this.getBoundingClientRect().y;
    window.scrollBy({top: viewportYAfter - viewportYBefore});
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-code-language-switch': LitDevCodeLanguageSwitch;
  }
}
