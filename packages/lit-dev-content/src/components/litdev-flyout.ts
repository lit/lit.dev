/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * A flyout panel that is visually anchored to some related element (usually the
 * button that opened the flyout) with a small arrow.
 */
@customElement('litdev-flyout')
export class LitDevFlyout extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      background: white;
      border-radius: 5px;
      border: 1px solid #ccc;
      box-shadow: rgb(0 0 0 / 20%) 0 0 3px 1px;
      box-sizing: border-box;
      color: black;
      margin-top: 10px;
      max-width: calc(100vw - var(--litdev-flyout-right, 0));
      position: fixed;
      right: var(--litdev-flyout-right, 0);
      top: var(--litdev-flyout-top, 0);
    }

    :host(:not([open])) {
      display: none;
    }

    [part='arrow'] {
      background: inherit;
      border: inherit;
      border-bottom: none;
      border-right: none;
      height: 10px;
      position: absolute;
      right: var(--litdev-flyout-arrow-right, 0);
      top: calc(-6px);
      transform: rotate(45deg);
      width: 10px;
    }
  `;

  /**
   * Whether the flyout is visible.
   */
  @property({type: Boolean, reflect: true})
  open = false;

  /**
   * The element this flyout should be anchored to.
   */
  @property({attribute: false})
  anchor?: Element;

  /**
   * How this flyout should be placed relative to the anchor.
   *
   * TODO(aomarks) Add more placements as needed.
   */
  @property()
  placement: 'bottom-end' = 'bottom-end';

  override update(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      if (this.open) {
        this._addEventListeners();
        this.dispatchEvent(new Event('open'));
        setTimeout(() => {
          this.focus();
        });
      } else if (changed.get('open')) {
        this._removeEventListeners();
        this.dispatchEvent(new Event('closed'));
      }
    }
    if (
      this.open &&
      (changed.has('anchor') || changed.has('placement') || changed.has('open'))
    ) {
      this._calculatePosition();
    }
    super.update(changed);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  override render() {
    return html`
      <slot></slot>
      <div part="arrow"></div>
    `;
  }

  private _calculatePosition() {
    let top, right, arrowRight;
    if (this.anchor === undefined) {
      top = 0;
      right = 0;
      arrowRight = 0;
    } else if (this.placement === 'bottom-end') {
      const rect = this.anchor.getBoundingClientRect();
      top = rect.bottom;
      right = window.innerWidth - rect.right;
      arrowRight = rect.width / 2;
    }
    this.style.setProperty('--litdev-flyout-top', `${top}px`);
    this.style.setProperty('--litdev-flyout-right', `${right}px`);
    this.style.setProperty('--litdev-flyout-arrow-right', `${arrowRight}px`);
  }

  private _addEventListeners() {
    window.addEventListener('keydown', this._onWindowKeydown);
    this.addEventListener('mousedown', this._onThisMousedown);
    requestAnimationFrame(() => {
      // Defer a microtask so that the click that opened this flyout won't cause
      // it to close.
      if (this.open) {
        window.addEventListener('mouseup', this._onWindowMouseup);
      }
    });
  }

  private _removeEventListeners() {
    window.removeEventListener('keydown', this._onWindowKeydown);
    this.removeEventListener('mousedown', this._onThisMousedown);
    window.removeEventListener('mouseup', this._onWindowMouseup);
  }

  private _clickStartedWithinThis = false;

  private readonly _onThisMousedown = () => {
    // This works a little better than simply checking if this is in the path of
    // the window click event, because it handles the case where the user
    // mousedowns inside the flyout, and then mouseups outside -- for example
    // when dragging to select the content of a text input and releasing
    // outside. We don't want to close in that case.
    this._clickStartedWithinThis = true;
  };

  private readonly _onWindowMouseup = () => {
    if (this._clickStartedWithinThis) {
      this._clickStartedWithinThis = false;
    } else {
      this.open = false;
    }
  };

  private readonly _onWindowKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.open = false;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-flyout': LitDevFlyout;
  }
}
