/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {customElement, state} from 'lit/decorators.js';
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

if (window.location.href.endsWith('/docs/')) {
  if (localStorage.getItem('experiment-collapsible') === 'clickable') {
    window.location.href = '/docs/introduction/';
  } else {
    window.location.href = '/docs/what-is-lit/';
  }
}

@customElement('toggle-sidebar')
export class ToggleSidebar extends LitElement {
  private pointerId = 0;
  private isDragging = false;
  private dragStartPos = {x: 0, y: 0};
  private previousPos = {x: 0, y: 0};
  @state()
  private diff = {x: 0, y: 0};

  static override styles = css`
    :host {
      display: contents;
    }

    #wrapper {
      display: flex;
      flex-direction: column;
      position: fixed;
      background-color: white;
      border: 1px solid black;
      padding: 8px;
      inset: calc(60px + 16px) 16px auto auto;
    }

    legend {
      user-select: none;
      cursor: grab;
    }

    legend:active {
      cursor: grabbing;
    }
  `;

  override render() {
    const wrapperStyles = {
      transform: `translateX(${this.diff.x}px) translateY(${this.diff.y}px)`,
    };
    return html`
      <fieldset id="wrapper" style=${styleMap(wrapperStyles)}>
        <legend
          @pointerdown=${this.onDragStart}
          @pointermove=${this.onDrag}
          @pointerup=${this.onDragEnd}
        >
          Select Experiment
        </legend>
        <div>Indent</div>
        <label>
          <input
            type="radio"
            name="experiment-indent"
            ?checked=${localStorage.getItem('experiment-indent') ===
              'no-indent' || !localStorage.getItem('experiment-indent')}
            @change=${this.onNoIndent}
          />
          No Indent
        </label>
        <label>
          <input
            type="radio"
            name="experiment-indent"
            ?checked=${localStorage.getItem('experiment-indent') === 'indent'}
            @change=${this.onIndent}
          />
          Indent
        </label>

        <div>Headers</div>
        <label>
          <input
            type="radio"
            name="experiment-collapsible"
            ?checked=${localStorage.getItem('experiment-collapsible') ===
              'collapsible' || !localStorage.getItem('experiment-collapsible')}
            @change=${this.onCollapse}
          />
          Collapsible
        </label>
        <label>
          <input
            type="radio"
            name="experiment-collapsible"
            ?checked=${localStorage.getItem('experiment-collapsible') ===
            'clickable'}
            @change=${this.onClickable}
          />
          Clickable
        </label>
      </fieldset>
    `;
  }

  firstUpdated() {
    switch (localStorage.getItem('experiment-indent')) {
      case 'indent':
        this.onIndent();
        break;
      case 'no-indent':
      default:
        this.onNoIndent();
        break;
    }

    switch (localStorage.getItem('experiment-collapsible')) {
      case 'clickable':
        this.onClickable();
        break;
      case 'collapsible':
      default:
        this.onCollapse();
        break;
    }
  }

  private onDragStart(e: PointerEvent) {
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
    this.isDragging = true;
    this.dragStartPos = {x: e.x, y: e.y};
    this.pointerId = e.pointerId;
  }

  private onDrag(e: PointerEvent) {
    if (!this.isDragging) {
      return;
    }
    this.diff = {
      x: this.previousPos.x + e.x - this.dragStartPos.x,
      y: this.previousPos.y + e.y - this.dragStartPos.y,
    };
  }

  private onDragEnd(e: PointerEvent) {
    const target = e.target as HTMLElement;
    target.releasePointerCapture(this.pointerId);
    this.isDragging = false;
    this.previousPos = this.diff;
  }

  private onNoIndent() {
    document.body.setAttribute('experiment-indent', 'no-indent');
    localStorage.setItem('experiment-indent', 'no-indent');
  }

  private onIndent() {
    document.body.setAttribute('experiment-indent', 'indent');
    localStorage.setItem('experiment-indent', 'indent');
  }

  private onCollapse() {
    document.body.setAttribute('experiment-collapsible', 'collapsible');
    localStorage.setItem('experiment-collapsible', 'collapsible');
  }

  private onClickable() {
    document.body.setAttribute('experiment-collapsible', 'clickable');
    localStorage.setItem('experiment-collapsible', 'clickable');
  }
}
