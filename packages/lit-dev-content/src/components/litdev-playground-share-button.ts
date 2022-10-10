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

import type {PropertyValues} from 'lit';
import type {LitDevPlaygroundShareLongUrl} from './litdev-playground-share-long-url.js';
import type {LitDevPlaygroundShareGist} from './litdev-playground-share-gist.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';
import type {Snackbar} from '@material/mwc-snackbar';
import type {Gist} from '../github/github-gists.js';

export type SaveMethod = 'gist' | 'longurl';

/**
 * The Playground "Share" button. Opens a menu with options for sharing as a
 * long base64 URL, or signing into GitHub and sharing as a Gist.
 *
 * @event save - Fired when the user performs a save action.
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
      z-index: 7;
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
  private _mostRecentSaveType: SaveMethod | undefined = undefined;

  /**
   * When true, clicking on this button will not open the flyout.
   */
  private _ignoreClick = false;

  /**
   * A function to allow this component to access the project upon save.
   */
  @property({attribute: false})
  getProjectFiles?: () => SampleFile[] | undefined;

  /**
   * The gist we are currently viewing, if any.
   */
  @property({attribute: false})
  activeGist?: Gist;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this._onWindowKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onWindowKeydown);
  }

  override update(changes: PropertyValues) {
    if (changes.has('_open')) {
      if (this._open) {
        this._longUrl?.generateUrl();
        this.dispatchEvent(new Event('opened'));
      } else {
        this.dispatchEvent(new Event('closed'));
      }
    }
    super.update(changes);
  }

  override render() {
    return html`
      <litdev-icon-button @click=${this._onClick}>
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
      @closed=${this._onFlyoutClosed}
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
          .activeGist=${this.activeGist}
          @created=${this._onGistSaved}
        ></litdev-playground-share-gist>
      </section>
    </litdev-flyout>`;
  }

  private _onFlyoutClosed() {
    this._open = false;
    // The flyout closes itself whenever a "mouseup" event fires outside of the
    // flyout. However, that includes clicking on this "Share" button! So if
    // we're not careful, we'll immediately re-open the flyout when that
    // happens. If the flyout has just closed itself, then we should ignore the
    // next button click. We can reset to normal after a rAF, because when this
    // happens it will be within the same microtask (because it's the same
    // click).
    this._ignoreClick = true;
    requestAnimationFrame(() => {
      this._ignoreClick = false;
    });
  }

  private _onClick() {
    if (!this._ignoreClick) {
      this._open = true;
    }
  }

  private _close() {
    this._open = false;
  }

  private async _showStatus(event: CustomEvent<{text: string}>) {
    const snackbar = this._snackbar;
    if (!snackbar) {
      return;
    }
    if (snackbar.open) {
      // Since we have a new message, we need to reset the snackbar close timer.
      // This also creates a new pop-in animation, which makes it more visually
      // obvious that the message has changed.
      snackbar.open = false;
      await snackbar.updateComplete;
    }
    snackbar.labelText = event.detail.text;
    snackbar.open = true;
  }

  private _onLongUrlSaved() {
    this._dispatchSaveEvent();
    this._close();
    this._mostRecentSaveType = 'longurl';
    this.activeGist = undefined;
  }

  private _onGistSaved() {
    this._dispatchSaveEvent();
    this._close();
    this._mostRecentSaveType = 'gist';
  }

  private readonly _onWindowKeydown = (event: KeyboardEvent) => {
    // TODO(aomarks) File a Playwright issue. Playwright seems to have a bug
    // where the "key" property is always uppercase, even when Shift was not
    // also held. This seems to violate the UI Events spec
    // (https://www.w3.org/TR/uievents-key/#:~:text=the%20key%20attribute%20value%20for%20the,%22q%22).
    if (
      event.key.toLowerCase() === 's' &&
      (event.ctrlKey || event.metaKey) &&
      !event.repeat
    ) {
      event.preventDefault(); // Don't trigger "Save page as"
      if (this._mostRecentSaveType === 'longurl') {
        this._longUrl?.generateUrl();
        this._dispatchSaveEvent();
        this._longUrl?.save();
      } else if (
        this._mostRecentSaveType === 'gist' &&
        this._gist?.canUpdateGist
      ) {
        this._dispatchSaveEvent();
        this._gist?.updateGist();
      } else {
        this._open = true;
      }
    }
  };

  /**
   * Fires a 'save' event to denote that the project has been saved.
   */
  private _dispatchSaveEvent() {
    this.dispatchEvent(new Event('save', {bubbles: false}));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-share-button': LitDevPlaygroundShareButton;
  }
}
