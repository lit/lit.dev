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

import type {
  PropertyValues,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import type {LitDevPlaygroundShareLongUrl} from './litdev-playground-share-long-url.js';
import type {LitDevPlaygroundShareGist} from './litdev-playground-share-gist.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';
import type {Snackbar} from '@material/mwc-snackbar';

/**
 * Handles the Ctrl+S and Cmd+S keyboard shortcuts.
 *
 * This is factored out for readability. Though it could also be nice to make it
 * more generic by taking a map of key-sequences and callbacks.
 */
class KeyboardController implements ReactiveController {
  private readonly _callback: () => void;
  private _ctrlDown = false;
  private _cmdDown = false;

  constructor(host: ReactiveControllerHost, callback: () => void) {
    host.addController(this);
    this._callback = callback;
  }

  hostConnected() {
    window.addEventListener('keydown', this._onKeydown);
    window.addEventListener('keyup', this._onKeyup);
    window.addEventListener('blur', this._reset);
  }

  hostDisconnected() {
    window.removeEventListener('keydown', this._onKeydown);
    window.removeEventListener('keyup', this._onKeyup);
    window.removeEventListener('blur', this._reset);
    this._reset();
  }

  private readonly _onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      this._ctrlDown = true;
    } else if (event.key === 'Meta') {
      this._cmdDown = true;
    } else if (event.key === 's' && (this._ctrlDown || this._cmdDown)) {
      event.preventDefault(); // Don't trigger "Save page as"
      this._callback();
    }
  };

  private readonly _onKeyup = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      this._ctrlDown = false;
    } else if (event.key === 'Meta') {
      this._cmdDown = false;
    }
  };

  private readonly _reset = () => {
    this._ctrlDown = false;
    this._cmdDown = false;
  };
}

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

  @query('litdev-playground-share-gist')
  private _gist?: LitDevPlaygroundShareGist;

  @query('mwc-snackbar')
  private _snackbar?: Snackbar;

  /**
   * How the user most recently saved, or undefined if they haven't saved this
   * pageload.
   */
  private _mostRecentSaveType: 'longurl' | 'gist' | undefined = undefined;

  /**
   * A function to allow this component to access the project upon save.
   */
  @property({attribute: false})
  getProjectFiles?: () => SampleFile[] | undefined;

  constructor() {
    super();
    new KeyboardController(this, () => this._onSaveKeyboardShortcut());
  }

  override update(changes: PropertyValues) {
    if (changes.has('_open') && this._open) {
      this._longUrl?.generateUrl();
    }
    super.update(changes);
  }

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
          @copied=${this._onLongUrlSaved}
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
          @created=${this._onGistSaved}
        ></litdev-playground-share-gist>
      </section>
    </litdev-flyout>`;
  }

  private _toggleOpen() {
    this._open = !this._open;
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

  private _onLongUrlSaved() {
    this._close();
    this._mostRecentSaveType = 'longurl';
  }

  private _onGistSaved() {
    this._close();
    this._mostRecentSaveType = 'gist';
  }

  private _onSaveKeyboardShortcut() {
    if (this._mostRecentSaveType === 'longurl') {
      this._longUrl?.generateUrl();
      this._longUrl?.save();
    } else if (this._mostRecentSaveType === 'gist' && this._gist?.isSignedIn) {
      // TODO(aomarks) Save a revision.
      this._gist?.createNewGist();
    } else {
      this._open = true;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-share-button': LitDevPlaygroundShareButton;
  }
}
