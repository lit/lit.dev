/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import './litdev-code-language-switch.js';

/**
 * An inline static code sample that can be toggled between JavaScript and
 * TypeScript.
 */
@customElement('litdev-switchable-sample')
export class LitDevSwitchableSample extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
    }

    litdev-code-language-switch {
      position: absolute;
      right: 6px;
      top: 6px;
    }
  `;

  override render() {
    return html`
      <litdev-code-language-switch></litdev-code-language-switch>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-switchable-sample': LitDevSwitchableSample;
  }
}
