/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import './litdev-icon-button.js';

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {signInToGithub} from '../github/github-signin.js';
import {createGist} from '../github/github-gists.js';
import {githubLogo} from '../icons/github-logo.js';

import type {GistFiles} from '../github/github-gists.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';

/**
 * An in-memory cache of the GitHub authentication tokens associated with each
 * instance of this component. This allows the user to authenticate only once
 * per page load, instead of on each save.
 *
 * By using a WeakMap instead of a class instance property, we make it much more
 * difficult for code outside of this module to directly access tokens.
 *
 * (It's not expected to usually have more than one instance of this component,
 * but it could happen e.g. in testing.)
 */
const tokenCache = new WeakMap<LitDevPlaygroundShareGist, string>();

const GITHUB_USER_ID_LOCALSTORAGE_KEY = 'github-user-id';

/**
 * Buttons for sharing a Playground project as a GitHub gist and signing into
 * GitHub when needed.
 */
@customElement('litdev-playground-share-gist')
export class LitDevPlaygroundShareGist extends LitElement {
  static styles = css`
    :host {
      align-items: center;
      display: flex;
    }
    litdev-icon-button {
      background: var(--color-blue);
      color: white;
    }
    litdev-icon-button:hover {
      background: blue;
    }
    #signOutButton {
      font-size: 16px;
      margin-left: 15px;
    }
    #signOutButton:visited {
      color: currentcolor;
    }
    #signOutButton:hover {
      color: blue;
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
   * A function to allow this component to access the project upon save.
   */
  getProjectFiles?: () => SampleFile[] | undefined;

  override render() {
    return this._signedIn
      ? [this._shareButton, this._signOutButton]
      : this._signInButton;
  }

  private get _signInButton() {
    return html`<litdev-icon-button @click=${this._signIn}>
      ${githubLogo} Sign in to GitHub
    </litdev-icon-button>`;
  }

  private get _signOutButton() {
    return html`<a id="signOutButton" href="#" @click=${this._signOut}
      >Sign out</a
    >`;
  }

  private get _shareButton() {
    return html`<litdev-icon-button @click=${this._createGist}>
      ${githubLogo} Save new gist
    </litdev-icon-button>`;
  }

  private get _signedIn(): boolean {
    return localStorage.getItem(GITHUB_USER_ID_LOCALSTORAGE_KEY) !== null;
  }

  private async _signIn() {
    if (!this.githubApiUrl || !this.clientId || !this.authorizeUrl) {
      throw new Error('Missing required properties');
    }
    // TODO(aomarks) User facing error if this fails.
    // TODO(aomarks) Show a scrim and some indication about what is happening
    //               while the GitHub sign in popup is open.
    const token = await signInToGithub({
      clientId: this.clientId,
      authorizeUrl: this.authorizeUrl,
    });
    tokenCache.set(this, token);
    // TODO(aomarks) Retrieve and store the actual user ID here so that we can
    // show a profile picture.
    localStorage.setItem(GITHUB_USER_ID_LOCALSTORAGE_KEY, '1');
    // Render share button.
    this.requestUpdate();
  }

  /**
   * Note signing out does not deauthorize the lit.dev GitHub app from the
   * user's GitHub account.
   */
  private _signOut(event: Event) {
    event.preventDefault();
    tokenCache.delete(this);
    localStorage.removeItem(GITHUB_USER_ID_LOCALSTORAGE_KEY);
    // Render sign-in button.
    this.requestUpdate();
  }

  private async _createGist() {
    if (!this.githubApiUrl) {
      throw new Error('Missing required properties');
    }
    const projectFiles = this.getProjectFiles?.();
    if (!projectFiles || projectFiles.length === 0) {
      // TODO(aomarks) The button should just be disabled in this case.
      throw new Error("Can't save an empty project");
    }

    let token = tokenCache.get(this);
    if (token === undefined) {
      await this._signIn();
    }
    token = tokenCache.get(this);
    if (token === undefined) {
      throw new Error('Error token not defined');
    }

    const gistFiles: GistFiles = Object.fromEntries(
      projectFiles.map((file) => [file.name, {content: file.content}])
    );

    // TODO(aomarks) User facing error if this fails.
    const gistId = await createGist(gistFiles, {
      apiBaseUrl: this.githubApiUrl,
      token,
    });

    window.location.hash = '#gist=' + gistId;
    await navigator.clipboard.writeText(window.location.toString());
    this.dispatchEvent(new Event('created'));
    this.dispatchEvent(
      new CustomEvent('status', {
        detail: {text: 'Gist created and URL copied to clipboard'},
        bubbles: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-share-gist': LitDevPlaygroundShareGist;
  }
}
