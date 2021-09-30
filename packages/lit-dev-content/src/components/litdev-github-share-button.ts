/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {signInToGithub} from '../github/github-signin.js';

/**
 * A button that shares a Playground project as a GitHub gist. If the user isn't
 * signed into GitHub yet, they are prompted to do so.
 *
 * // TODO(aomarks) Implement actually sharing. This is just an early WIP.
 * // TODO(aomarks) Show a scrim and some indication about what is happening
 * //               while the popup is open.
 * // TODO(aomarks) Style this button
 */
@customElement('litdev-github-share-button')
export class LitDevGitHubShareButton extends LitElement {
  /**
   * GitHub OAuth App client ID. Generated when a GitHub OAuth App is first
   * created.
   */
  @property()
  clientId?: string;

  /**
   * URL where users will be redirected to authorize with GitHub.
   */
  @property()
  authorizeUrl?: string;

  override render() {
    return html`<button @click=${this._onClick}>Share with GitHub</button>`;
  }

  private async _onClick() {
    if (!this.clientId || !this.authorizeUrl) {
      return;
    }
    const result = await signInToGithub({
      clientId: this.clientId,
      authorizeUrl: this.authorizeUrl,
    });
    if (result.error) {
      alert(`error: ${result.error}`);
    } else {
      alert(`code: ${result.code}`);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-github-share-button': LitDevGitHubShareButton;
  }
}
