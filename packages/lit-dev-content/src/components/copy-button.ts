/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {property} from 'lit/decorators.js';
import {copyIcon} from '../icons/copy-icon.js';

import './litdev-ripple-icon-button.js';

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
    return html`<litdev-ripple-icon-button
      @click=${this._click}
      label="Copy to clipboard"
    >
      ${copyIcon}
    </litdev-ripple-icon-button>`;
  }

  private _click() {
    if (this.text === undefined) {
      return;
    }
    navigator.clipboard.writeText(this.text);
  }
}

customElements.define('copy-button', CopyButton);
