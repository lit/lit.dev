/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {property} from 'lit/decorators.js';

const ACTIVE_HOVER_MS = 300;

/**
 * Vertical or horizontal resize bar.
 */
export class ResizeBar extends LitElement {
  static styles = css`
    :host {
      z-index: 1;
      position: relative;
      touch-action: none;
      background: var(--resize-bar-color, #ccc);
    }

    :host([dimension='width']) {
      width: var(--resize-bar-touch-size, 3px);
    }

    :host([dimension='height']) {
      height: var(--resize-bar-touch-size, 6px);
    }

    :host([dimension='width']) > #touchTarget {
      cursor: col-resize;
    }

    :host([dimension='height']) > #touchTarget {
      cursor: row-resize;
      /** TODO(sorvell): Chrome seems to need this, but it's unclear why */
      top: -50%;
      height: 150%;
    }

    #touchTarget {
      position: absolute;
      inset: 0;
      touch-action: none;
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
   * Whether this resizer is active. Either the user has hovered over it for
   * enough time, or they're dragging it.
   */
  @property({type: Boolean, reflect: true})
  active = false;

  /**
   * Whether this resizer is being dragged.
   */
  @property({type: Boolean, reflect: true})
  resizing = false;

  private _hoverTimer?: ReturnType<typeof setTimeout>;
  private _updateSizeRafId?: ReturnType<typeof requestAnimationFrame>;

  render() {
    return html`<div
      id="touchTarget"
      @pointerover=${this._onPointerOver}
      @pointerleave=${this._onPointerLeave}
      @pointerdown=${this._onPointerDown}
    ></div>`;
  }

  private _onPointerOver() {
    this._hoverTimer = setTimeout(() => {
      this.active = true;
      this._hoverTimer = undefined;
    }, ACTIVE_HOVER_MS);
  }

  private _onPointerLeave() {
    if (this.active && !this.resizing) {
      this.active = false;
    }
    if (this._hoverTimer !== undefined) {
      clearTimeout(this._hoverTimer);
      this._hoverTimer = undefined;
    }
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
    this.active = true;
    this.resizing = true;
    this.setPointerCapture(pointerId);
    const isWidthDimension = this.dimension === 'width';
    const {left, right, top, bottom} = target.getBoundingClientRect();
    const oldSize = isWidthDimension ? right - left : bottom - top;

    let clientX = 0;
    let clientY = 0;

    const onPointermove = (event: PointerEvent) => {
      // Only update once per animation frame, but with the latest offsets.
      clientX = event.clientX;
      clientY = event.clientY;
      if (this._updateSizeRafId !== undefined) {
        return;
      }
      this._updateSizeRafId = requestAnimationFrame(() => {
        this._updateSizeRafId = undefined;
        if (!this.property) {
          return;
        }
        // TODO(aomarks) This calculation also depends on which edge we're on. For
        // now we assume that when the dimension is width we resize the element to
        // the left of the bar, and when dimension is height we resize the element
        // underneath the bar.
        const newSize = Math.max(
          0,
          isWidthDimension ? oldSize + clientX - right : oldSize - clientY + top
        );
        document.documentElement.style.setProperty(
          this.property,
          `${newSize}px`
        );
      });
    };
    this.addEventListener('pointermove', onPointermove);

    // Prevent Chrome from showing a context menu on a long press.
    this.addEventListener('contextmenu', (e) => e.preventDefault(), {
      once: true,
    });

    // TODO(aomarks) We had a report that when moving the cursor quickly, we can
    // miss this event and get stuck. Shouldn't happen because of
    // setPointerCapture, but maybe there is a bug?
    this.addEventListener(
      'pointerup',
      () => {
        this.releasePointerCapture(pointerId);
        this.removeEventListener('pointermove', onPointermove);
        this.active = false;
        this.resizing = false;
      },
      {once: true}
    );
  }
}

customElements.define('resize-bar', ResizeBar);
