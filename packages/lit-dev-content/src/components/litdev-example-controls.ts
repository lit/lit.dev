/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './litdev-code-language-switch.js';

/**
 * Controls for lit.dev code examples.
 */
@customElement('litdev-example-controls')
export class LitDevExampleControls extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      margin-left: auto;
    }

    #openInPlayground {
      display: flex;
      color: inherit;
      opacity: 70%;
      fill: #5f5f5f;
    }

    #openInPlayground:hover {
      opacity: 100%;
      fill: #005cc5bd;
    }

    litdev-code-language-switch {
      margin-left: 10px;
    }
  `;

  /**
   * Path to the project dir from `samples/PROJECT/project.json`.
   */
  @property()
  project?: string;

  @property({type: Boolean})
  hideCodeLanguageSwitch = false;

  override render() {
    return html`
      ${this.project
        ? html`<a
            id="openInPlayground"
            title="Open this example in the playground"
            target="_blank"
            href="/playground/#sample=${this.project}"
          >
            <!-- Source: https://material.io/resources/icons/?icon=launch&style=baseline -->
            <svg width="22px" height="22px" viewBox="0 0 24 24">
              <path
                d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
              />
            </svg>
          </a>`
        : nothing}
      ${this.hideCodeLanguageSwitch
        ? nothing
        : html`<litdev-code-language-switch></litdev-code-language-switch>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-example-controls': LitDevExampleControls;
  }
}
