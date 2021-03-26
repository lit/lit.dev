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

/**
 * Vertical or horizontal resize bar.
 */
export class ResizeBar extends LitElement {
  static styles = css`
    :host {
      z-index: 1;
      position: relative;
    }

    :host([dimension='width']) {
      width: 3px;
    }

    :host([dimension='height']) {
      height: 3px;
    }

    :host([dimension='width']) > #touchTarget {
      cursor: col-resize;
      position: absolute;
      top: 0;
      left: calc(var(--resize-bar-touch-size, 24px) / -2);
      width: var(--resize-bar-touch-size, 24px);
      height: 100%;
    }

    :host([dimension='height']) > #touchTarget {
      cursor: row-resize;
      position: absolute;
      top: calc(var(--resize-bar-touch-size, 24px) / -2);
      left: 0;
      width: 100%;
      height: var(--resize-bar-touch-size, 24px);
    }
  `;

  /**
   * Orientation of the target being resized by this bar. If horizontal, the bar
   * stretches from left to right, and resizes the target height. If vertical, the bar
   */
  @property({reflect: true, hasChanged: () => false})
  dimension: 'width' | 'height' = 'width';

  /**
   * CSS custom property to set on the HTML element on resize.
   */
  @property({hasChanged: () => false})
  property?: string;

  /**
   * Id in the host scope of the element that is being resized.
   */
  @property({hasChanged: () => false})
  target?: string;

  /**
   * Id in the host scope of the element that is being resized.
   */
  @property({type: Boolean, reflect: true})
  resizing = false;

  render() {
    return html`<div
      id="touchTarget"
      @pointerdown=${this._onPointerDown}
    ></div>`;
  }

  private _onPointerDown({pointerId}: PointerEvent) {
    if (!this.target || !this.property) {
      return;
    }
    const target = (this.getRootNode() as ShadowRoot | Document).getElementById(
      this.target
    );
    if (!target) {
      return;
    }
    this.resizing = true;
    this.setPointerCapture(pointerId);
    const isWidthDimension = this.dimension === 'width';
    const {left, right, top, bottom} = target.getBoundingClientRect();
    const oldSize = isWidthDimension ? right - left : bottom - top;

    const onPointermove = ({clientX, clientY}: PointerEvent) => {
      if (!this.property) {
        return;
      }
      // TODO(aomarks) This calculation also depends on which edge we're on. For
      // now we assume that when the dimension is width we resize the element to
      // the left of the bar, and when dimension is height we resize the element
      // underneath the bar.
      const newSize = isWidthDimension
        ? oldSize + clientX - right
        : oldSize - clientY + top;
      document.documentElement.style.setProperty(this.property, `${newSize}px`);
    };
    this.addEventListener('pointermove', onPointermove);

    // TODO(aomarks) We had a report that when moving the cursor quickly, we can
    // miss this event and get stuck. Shouldn't happen because of
    // setPointerCapture, but maybe there is a bug?
    this.addEventListener(
      'pointerup',
      () => {
        this.releasePointerCapture(pointerId);
        this.removeEventListener('pointermove', onPointermove);
        this.resizing = false;
      },
      {once: true}
    );
  }
}

customElements.define('resize-bar', ResizeBar);
