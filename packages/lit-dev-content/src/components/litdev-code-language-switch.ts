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
      font-size: 13px;
      width: 3.3em;
      height: 1.6em;
      border-radius: 1em;
      padding: 0.1em 0.2em;
      border: 1.5px solid #ccc;
      background: white;
      box-shadow: rgb(0 0 0 / 5%) 0px 0px 1px 1px inset;
      font-family: 'Open Sans', sans-serif;
    }

    button {
      flex: 1;
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
      box-shadow: rgb(0 0 0 / 30%) 1px 1px 2px;
      border-radius: 1em;
    }

    button:hover > #toggle {
      background: #005cc5bd;
    }

    [position='js'] > #toggle {
      left: 0;
    }

    [position='ts'] > #toggle {
      left: 50%;
    }

    [position='ts'] > #tsLabel,
    [position='js'] > #jsLabel {
      color: white;
      font-weight: 600;
      opacity: 100%;
    }

    #jsLabel,
    #tsLabel {
      display: inline-flex;
      z-index: 1;
      padding-left: 0.25em;
      opacity: 60%;
      transition: color 100ms, opacity 100ms;
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
        role="switch"
        aria-checked=${mode == 'ts' ? 'true' : 'false'}
        aria-title="Toggle TypeScript"
        title=${mode === 'ts' ? 'Disable TypeScript' : 'Enable TypeScript'}
        position=${mode}
        @click=${this._toggleLanguageAndAdjustScroll}
      >
        <span id="jsLabel">JS</span>
        <span id="tsLabel">TS</span>
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
