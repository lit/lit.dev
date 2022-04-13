/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {greenCheckIcon} from '../icons/green-check-icon.js';
import {redXIcon} from '../icons/red-x-icon.js';
import {yellowBangIcon} from '../icons/yellow-bang-icon.js';
import {blueInfoIcon} from '../icons/blue-info-icon.js';

export type AsideVariant = 'positive' | 'negative' | 'warn' | 'info';

@customElement('litdev-aside')
export class LitDevAside extends LitElement {
  static styles = css`
    :host {
      color: currentColor;
      display: block;
      margin: 1em 0;
    }

    aside {
      display: flex;
      border-style: solid;
      border-width: 1px;
      border-color: var(--lit-dev-aside-border-color, #ccc);
      padding: 1em 1em 1em 0em;
    }

    slot {
      display: block;
      flex-grow: 1;
    }

    svg {
      width: 1.5em;
      margin-inline: 1em;
    }

    :host(:not([no-header])) ::slotted(:first-child) {
      font-weight: bold;
    }

    ::slotted(*) {
      margin: 0;
    }
  `;

  @property({type: String})
  type: AsideVariant = 'info';

  @property({type: Boolean, reflect: true, attribute: 'no-header'})
  noHeader = false;

  render() {
    return html`
      <aside>
        <div>${this._renderIcon()}</div>
        <slot></slot>
      </aside>
    `;
  }

  private _renderIcon() {
    switch (this.type) {
      case 'positive':
        return greenCheckIcon;
      case 'negative':
        return redXIcon;
      case 'warn':
        return yellowBangIcon;
      case 'info':
        return blueInfoIcon;
      default:
        const exhaustiveCheck: never = this.type;
        console.warn(
          `Received unexpected type for <litdev-aside>: ${exhaustiveCheck}`
        );
        return nothing;
    }
  }
}
