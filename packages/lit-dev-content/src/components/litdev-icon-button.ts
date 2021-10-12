/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * A button with lit.dev styling.
 *
 * If an svg element is slotted as the first child, its size and margin is set
 * automatically.
 */
@customElement('litdev-icon-button')
export class LitDevIconButton extends LitElement {
  static override styles = css`
    :host {
      border: 1px solid currentcolor;
      box-sizing: border-box;
      cursor: pointer;
      display: inline-block;
      font-family: 'Open Sans', sans-serif;
      font-size: 16px;
      padding: 5px 8px;
    }

    :host(:hover) {
      background-color: rgba(0, 0, 0, 0.25);
    }

    button {
      align-items: center;
      background: transparent;
      border: none;
      color: inherit;
      cursor: inherit;
      display: flex;
      font-family: inherit;
      font-size: inherit;
      padding: 0;
    }

    slot {
      display: flex;
      align-items: center;
    }

    ::slotted(svg:first-child) {
      height: 1.5em;
      margin-right: 1em;
      width: 1.5em;
    }
  `;

  override render() {
    return html`
      <button>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-icon-button': LitDevIconButton;
  }
}
