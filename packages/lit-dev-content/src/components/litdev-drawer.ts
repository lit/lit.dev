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

import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import './litdev-ripple-icon-button.js';

// https://material.io/resources/icons/?icon=close
const closeIcon = html` <svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="currentcolor"
>
  <path
    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
  />
</svg>`;

// Source: https://material.io/resources/icons/?icon=menu_book
const bookIcon = html` <svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="currentcolor"
>
  <path
    d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z"
  />
  <path
    d="M17.5,10.5c0.88,0,1.73,0.09,2.5,0.26V9.24C19.21,9.09,18.36,9,17.5,9c-1.7,0-3.24,0.29-4.5,0.83v1.66 C14.13,10.85,15.7,10.5,17.5,10.5z"
  />
  <path
    d="M13,12.49v1.66c1.13-0.64,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26V11.9c-0.79-0.15-1.64-0.24-2.5-0.24 C15.8,11.66,14.26,11.96,13,12.49z"
  />
  <path
    d="M17.5,14.33c-1.7,0-3.24,0.29-4.5,0.83v1.66c1.13-0.64,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26v-1.52 C19.21,14.41,18.36,14.33,17.5,14.33z"
  />
</svg>`;

/**
 * A drawer that expands and collapses.
 */
@customElement('litdev-drawer')
export class LitDevDrawer extends LitElement {
  static styles = css`
    :host {
      width: var(--litdev-drawer-open-width);
      transition: transform var(--litdev-drawer-transition-duration),
        margin-right var(--litdev-drawer-transition-duration);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    :host(:not([open])) {
      /* We don't actually change width, we instead shift everything left. This
         way there is no content reflow within the drawer during animation. */
      transform: translateX(
        calc(
          -1 * calc(var(--litdev-drawer-open-width) -
                var(--litdev-drawer-closed-width))
        )
      );
      /* We also apply a negative margin, so that we don't take up the extra
         space. */
      margin-right: calc(
        -1 * calc(var(--litdev-drawer-open-width) -
              var(--litdev-drawer-closed-width))
      );
      overflow-y: hidden !important;
    }

    :host(:not([open])) > #content {
      display: none;
    }

    #header {
      flex: 0 0 var(--litdev-drawer-header-height);
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1;
      background: inherit;
    }

    #openCloseButton {
      width: 37px;
      height: 37px;
      padding: 4px;
      position: absolute;
      /* Align close icon to content, accounting for larger touch target */
      right: 0;
      transition: transform var(--litdev-drawer-transition-duration);
    }

    :host(:not([closed])) #openCloseButton {
      transform: var(--litdev-drawer-closed-button-transform);
    }

    #content {
      flex: 1 1;
      overflow-y: overlay;
      opacity: 1;
      transition: opacity var(--litdev-drawer-transition-duration);
    }

    /* On some platforms like Linux, a traditional scrollbar will be always
       visible, which is distracting. This reproduces something similar to macOS
       style on all platforms. */
    #content::-webkit-scrollbar {
      width: 1rem;
    }

    #content:hover::-webkit-scrollbar-thumb {
      background: #999;
      background-clip: content-box;
      border: 4px solid transparent;
      border-radius: 10px;
    }

    :host(:not([open])) #content {
      opacity: 0;
    }

    :host(:not([open]):not([transitioning])) > #content {
      visibility: hidden;
    }
  `;

  @property({type: Boolean, reflect: true})
  open = false;

  render() {
    return html`
      <div id="header" part="header">
        <slot name="header"></slot>

        <litdev-ripple-icon-button
          id="openCloseButton"
          aria-label="Open or close examples drawer"
          @click=${this._onClickToggleButton}
        >
          ${this.open ? closeIcon : bookIcon}
        </litdev-ripple-icon-button>
      </div>

      <div id="content">
        <slot name="content"></slot>
      </div>
    `;
  }

  private _onClickToggleButton() {
    this.open = !this.open;
    this.setAttribute('transitioning', '');
    this.addEventListener(
      'transitionend',
      () => {
        this.removeAttribute('transitioning');
      },
      {once: true}
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-drawer': LitDevDrawer;
  }
}
