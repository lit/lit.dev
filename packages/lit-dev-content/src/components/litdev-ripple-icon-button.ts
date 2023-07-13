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
   * Aria label for the button.
   */
  @property({attribute: 'button-title'})
  buttonTitle = '';

  /**
   * Href for the link button. If defined, this component switches to using an
   * anchor element instead of a button.
   */
  @property()
  href = '';

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

    .root {
      height: inherit;
      width: inherit;
      border-radius: inherit;
      color: currentColor;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      vertical-align: middle;
      box-sizing: border-box;
      cursor: pointer;
      padding: 0;
      background-color: transparent;
      border: none;
      z-index: 0;
      outline: none;
      position: relative;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
    }

    .root:disabled {
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

    .root:is(:hover, :focus, :active) #ripple::before {
      transform: scale(1);
    }

    .root:active #ripple::after {
      animation: ripple-scale-in 225ms forwards;
    }

    .root:hover #ripple::before {
      opacity: 0.04;
    }

    .root:is(:focus, :active) #ripple::before,
    .root:active #ripple::after {
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
    return this.href ? this.renderAnchorRoot() : this.renderButtonRoot();
  }

  protected renderButtonRoot() {
    return html`
      <button
        class="root"
        part="root button"
        aria-label=${this.label ? this.label : nothing}
        ?disabled=${this.disabled}
        title=${this.buttonTitle ?? (nothing as unknown as string)}
      >
        ${this.renderContent()}
      </button>
    `;
  }

  protected renderAnchorRoot() {
    return html`
      <a
        class="root"
        part="root anchor"
        href=${this.href}
        aria-label=${this.label ? this.label : nothing}
        ?disabled=${this.disabled}
      >
        ${this.renderContent()}
      </a>
    `;
  }

  protected renderContent() {
    return html` <div id="ripple"></div>
      <slot></slot>`;
  }
}
