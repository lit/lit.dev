/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, customElement} from 'lit-element';
import './litdev-typescript-switch.js';

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

    litdev-typescript-switch {
      position: absolute;
      right: 6px;
      top: 6px;
    }
  `;

  override render() {
    return html`
      <litdev-typescript-switch></litdev-typescript-switch>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-switchable-sample': LitDevSwitchableSample;
  }
}
