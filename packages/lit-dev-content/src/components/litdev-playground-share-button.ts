/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import './litdev-flyout.js';
import './litdev-playground-share-gist.js';
import './litdev-playground-share-long-url.js';
import '@material/mwc-snackbar';

import {LitElement, html, css} from 'lit';
import {customElement, property, state, query} from 'lit/decorators.js';
import {shareIcon} from '../icons/share-icon.js';

import type {LitDevPlaygroundShareLongUrl} from './litdev-playground-share-long-url.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';
import type {Snackbar} from '@material/mwc-snackbar';

/**
 * The Playground "Share" button. Opens a menu with options for sharing as a
 * long base64 URL, or signing into GitHub and sharing as a Gist.
 */
@customElement('litdev-playground-share-button')
export class LitDevPlaygroundShareButton extends LitElement {
  static styles = css`
    section {
      padding: 15px;
    }
    section:not(:last-of-type) {
      border-bottom: 1px solid #ccc;
    }
    section > h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
    }
    #menu {
      z-index: 10;
    }
    mwc-snackbar {
      background: blue;
    }
  `;

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

  /**
   * Base URL for the GitHub API.
   */
  @property()
  githubApiUrl?: string;

  /**
   * Base URL for the GitHub avatar service.
   */
  @property()
  githubAvatarUrl?: string;

  /**
   * Whether the share menu is open.
   */
  @state()
  private _open = false;

  @query('litdev-playground-share-long-url')
  private _longUrl?: LitDevPlaygroundShareLongUrl;

  @query('mwc-snackbar')
  private _snackbar?: Snackbar;

  /**
   * A function to allow this component to access the project upon save.
   */
  @property({attribute: false})
  getProjectFiles?: () => SampleFile[] | undefined;

  override render() {
    return html`
      <litdev-icon-button @click=${this._toggleOpen}>
        ${shareIcon} Share
      </litdev-icon-button>

      ${this._menu}

      <!-- TODO(aomarks) Not the biggest fan of the snackbar here,
           it feels easy to miss. -->
      <mwc-snackbar></mwc-snackbar>
    `;
  }

  private get _menu() {
    return html`<litdev-flyout
      id="menu"
      .anchor=${this}
      .open=${this._open}
      @closed=${this._close}
      @status=${this._showStatus}
    >
      <section>
        <h3>Long URL</h3>
        <litdev-playground-share-long-url
          .getProjectFiles=${this.getProjectFiles}
          @copied=${this._close}
        ></litdev-playground-share-long-url>
      </section>

      <section>
        <h3>GitHub Gist</h3>
        <litdev-playground-share-gist
          .clientId=${this.clientId}
          .authorizeUrl=${this.authorizeUrl}
          .githubApiUrl=${this.githubApiUrl}
          .githubAvatarUrl=${this.githubAvatarUrl}
          .getProjectFiles=${this.getProjectFiles}
          @created=${this._close}
        ></litdev-playground-share-gist>
      </section>
    </litdev-flyout>`;
  }

  private _toggleOpen() {
    this._open = !this._open;
    if (this._open) {
      this._longUrl?.generateUrl();
    }
  }

  private _close() {
    this._open = false;
  }

  private _showStatus(event: CustomEvent<{text: string}>) {
    const snackbar = this._snackbar;
    if (!snackbar) {
      return;
    }
    snackbar.labelText = event.detail.text;
    snackbar.open = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-share-button': LitDevPlaygroundShareButton;
  }
}
