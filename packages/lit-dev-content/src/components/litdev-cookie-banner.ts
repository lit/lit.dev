/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import './litdev-ripple-icon-button.js';

@customElement('litdev-cookie-banner')
export default class LitdevCookieBanner extends LitElement {
  static styles = css`
    :host {
      --_inset: 24px;
      font-family: Manrope, sans-serif;
      font-size: 0.9rem;
      display: block;
      position: fixed;
      inset-block-end: var(--_inset);
      inset-inline-start: var(--_inset);
      z-index: 10;
      background-color: var(--color-dark-gray);
      color: white;
      padding: 0.88rem;
      padding-block-end: 0.5rem;
      border: 1px solid white;
      border-radius: 8px;
      max-width: 430px;
      box-sizing: border-box;
      width: calc(100vw - 2 * var(--_inset));
      /* Material 2 elevation 5
      https://lit.dev/playground/?mods=gists#gist=3ee0643323ce76d53bb8f5a98149dd45
      */
      box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 5px -1px,
        rgba(0, 0, 0, 0.14) 0px 5px 8px 0px,
        rgba(0, 0, 0, 0.12) 0px 1px 14px 0px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-block-start: 16px;
    }

    .visually-hidden {
      position: absolute;
      inset-inline-start: -9999px;
    }

    litdev-ripple-icon-button {
      width: auto;
      height: 36px;
      margin-inline: 0.5rem;
      color: var(--color-dark-cyan);
    }

    litdev-ripple-icon-button::part(root) {
      padding: 8px;
      font-size: 0.9rem;
      font-weight: bold;
    }
  `;
  override render() {
    return html`
      <div>
        <h2 class="visually-hidden">Cookies consent notice</h2>
        <div class="message">
          Lit.dev uses cookies from Google to deliver and enhance the quality of
          its services and to analyze traffic.
        </div>
        <div class="actions">
          <litdev-ripple-icon-button
            href="https://policies.google.com/technologies/cookies"
          >
            Learn more
          </litdev-ripple-icon-button>
          <litdev-ripple-icon-button @click=${this.onOkClick}>
            Ok, got it
          </litdev-ripple-icon-button>
        </div>
      </div>
    `;
  }

  private onOkClick() {
    localStorage.setItem('gtag-banner-shown', 'true');
    this.remove();
  }
}
