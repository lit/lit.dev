/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {LitElement, html, css, property} from 'lit-element';
import '@material/mwc-icon-button';

/**
 * A button that copies some text when clicked.
 */
export class CopyButton extends LitElement {
  static styles = css`
    :host {
      --mdc-theme-primary: currentcolor;
    }
  `;

  /** Text to copy. */
  @property()
  text?: string;

  render() {
    return html`<mwc-icon-button
      outlined
      @click=${this._click}
      label="Copy to clipboard"
    >
      <!-- Source: https://material.io/resources/icons/?icon=content_copy&style=baseline -->
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
        />
      </svg>
    </mwc-icon-button>`;
  }

  private _click() {
    if (this.text === undefined) {
      return;
    }
    navigator.clipboard.writeText(this.text);
  }
}

customElements.define('copy-button', CopyButton);
