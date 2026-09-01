/**
 * @license
 * Copyright The Lit Project
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('litdev-ripple-icon-button')
export class LitDevRippleIconButton extends LitElement {
  /**
   * Accessible label for the button.
   */
  @property()
  label = '';

  /**
   * Tooltip text for the button.
   */
  @property({attribute: 'button-title'})
  buttonTitle = '';

  /**
   * ARIA pressed state for toggle buttons.
   */
  @property({attribute: false})
  pressed?: boolean;

  /**
   * ARIA expanded state for disclosure buttons.
   */
  @property()
  expanded: '' | 'true' | 'false' = '';

  /**
   * ID of the element controlled by a disclosure button.
   */
  @property()
  controls = '';

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

    .root:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .root:disabled,
    .root[aria-disabled='true'] {
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

  protected override firstUpdated() {
    // Lit hydration adopts server attributes without patching client-only
    // state, so reconcile ARIA state once after the initial hydration pass.
    const button = this.renderRoot.querySelector('button');
    if (this.pressed !== undefined) {
      button?.setAttribute('aria-pressed', String(this.pressed));
    }
    if (this.expanded) {
      button?.setAttribute('aria-expanded', this.expanded);
    }
    if (this.controls) {
      button?.setAttribute('aria-controls', this.controls);
    }
  }

  protected renderButtonRoot() {
    return html`
      <button
        type="button"
        class="root"
        part="root button"
        aria-label=${this.label ? this.label : nothing}
        aria-pressed=${this.pressed === undefined
          ? nothing
          : String(this.pressed)}
        aria-expanded=${this.expanded || nothing}
        aria-controls=${this.controls || nothing}
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
        href=${this.disabled ? nothing : this.href}
        role=${this.disabled ? 'link' : nothing}
        aria-label=${this.label ? this.label : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        tabindex=${this.disabled ? '-1' : nothing}
        title=${this.buttonTitle || nothing}
        @click=${this._handleAnchorClick}
      >
        ${this.renderContent()}
      </a>
    `;
  }

  protected renderContent() {
    return html`<div id="ripple"></div>
      <slot></slot>`;
  }

  private _handleAnchorClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
