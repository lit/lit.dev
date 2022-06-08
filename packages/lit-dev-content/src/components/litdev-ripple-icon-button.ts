/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('litdev-ripple-icon-button')
export class LitDevRippleIconButton extends LitElement {
  /**
   * Aria label for the button.
   */
  @property()
  label = '';

  /**
   * Whether or not the button is disabled.
   */
  @property({type: Boolean})
  disabled = false;

  static styles = css`
    @keyframes ripple-scale-in {
      from {
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transform: scale(0);
      }

      to {
        transform: scale(1);
      }
    }
    :host {
      display: block;
      height: 48px;
      width: 48px;
      border-radius: 8px;
    }

    button {
      height: inherit;
      width: inherit;
      border-radius: inherit;
      color: currentColor;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding: 0;
      background-color: transparent;
      border: none;
      z-index: 0;
      outline: none;
      position: relative;
    }

    button:disabled {
      cursor: default;
      pointer-events: none;
      opacity: 0.38;
    }

    #ripple {
      position: absolute;
      inset: 0;
      border-radius: inherit;
    }

    #ripple::before,
    #ripple::after {
      content: '';
      inset: inherit;
      border-radius: inherit;
      position: absolute;
      z-index: -1;
      background-color: currentColor;
      opacity: 0;

      transition: opacity 15ms linear;
      transform: scale(0);
    }

    button:is(:hover, :focus, :active) #ripple::before {
      transform: scale(1);
    }

    button:active #ripple::after {
      animation: ripple-scale-in 225ms forwards;
    }

    button:hover #ripple::before {
      opacity: 0.04;
    }

    button:is(:focus, :active) #ripple::before,
    button:active #ripple::after {
      opacity: 0.12;
    }

    ::slotted(*) {
      z-index: 1;
      fill: currentColor;
      /* If the user focuses the button, then clicks on the SVG, the button
        loses focus and ripple opacity is weird */
      pointer-events: none;
    }
  `;
  render() {
    return html`
      <button
        aria-label=${this.label ? this.label : nothing}
        ?disabled=${this.disabled}
      >
        <div id="ripple"></div>
        <slot></slot>
      </button>
    `;
  }
}
