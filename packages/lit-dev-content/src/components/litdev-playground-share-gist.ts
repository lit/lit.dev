/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import './litdev-icon-button.js';

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {signInToGithub} from '../github/github-signin.js';
import {getAuthenticatedUser} from '../github/github-user.js';
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

const GITHUB_USER_LOCALSTORAGE_KEY = 'github-user';

/**
 * Buttons for sharing a Playground project as a GitHub gist and signing into
 * GitHub when needed.
 */
@customElement('litdev-playground-share-gist')
export class LitDevPlaygroundShareGist extends LitElement {
  static styles = css`
    litdev-icon-button {
      background: var(--color-blue);
      color: white;
    }

    litdev-icon-button:hover {
      background: blue;
    }

    #signInStatus {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 16px;
    }

    #signInStatus > span {
      display: flex;
      align-items: center;
    }

    #avatar {
      margin-left: 8px;
      border-radius: 50%;
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
   * Base URL for the GitHub avatar service.
   */
  @property()
  githubAvatarUrl?: string;

  /**
   * A function to allow this component to access the project upon save.
   */
  getProjectFiles?: () => SampleFile[] | undefined;

  override render() {
    return this._signedInUser
      ? [this._signedInStatus, this._shareButton]
      : this._signInButton;
  }

  private get _signInButton() {
    return html`<litdev-icon-button id="signInButton" @click=${this._signIn}>
      ${githubLogo} Sign in to GitHub
    </litdev-icon-button>`;
  }

  private get _signedInStatus() {
    const {id, login} = this._signedInUser!;
    const avatarSize = 24;
    const avatarUrl = new URL(
      `/u/${id}?s=${/* double for high dpi */ avatarSize * 2}`,
      this.githubAvatarUrl
    ).href;
    return html`<div id="signInStatus">
      <span>
        <span>Signed in as <b>${login}</b></span>
        <img
          id="avatar"
          src="${avatarUrl}"
          width="${avatarSize}"
          height="${avatarSize}"
      /></span>
      <a id="signOutButton" href="#" @click=${this._signOut}>Sign out</a>
    </div>`;
  }

  private get _shareButton() {
    return html`<litdev-icon-button
      id="saveNewGistButton"
      @click=${this._createGist}
    >
      ${githubLogo} Save new gist
    </litdev-icon-button>`;
  }

  private get _signedInUser(): {id: number; login: string} | undefined {
    const value = localStorage.getItem(GITHUB_USER_LOCALSTORAGE_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return undefined;
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
    const {id, login} = await getAuthenticatedUser({
      apiBaseUrl: this.githubApiUrl,
      token,
    });
    localStorage.setItem(
      GITHUB_USER_LOCALSTORAGE_KEY,
      JSON.stringify({id, login})
    );
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
    localStorage.removeItem(GITHUB_USER_LOCALSTORAGE_KEY);
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
