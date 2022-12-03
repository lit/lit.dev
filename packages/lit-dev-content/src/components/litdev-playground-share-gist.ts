/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import './litdev-icon-button.js';

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {signInToGithub} from '../github/github-signin.js';
import {getAuthenticatedUser} from '../github/github-user.js';
import {createGist, updateGist} from '../github/github-gists.js';
import {githubLogo} from '../icons/github-logo.js';
import {showErrors} from '../errors.js';
import {playgroundToGist} from '../util/gist-conversion.js';

import type {Gist} from '../github/github-gists.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';
import {
  deleteHashSearchParam,
  setHashSearchParam,
} from '../util/url-helpers.js';

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
 * Safely writes to the hash of the current URL, and deletes any 'project' hash
 * parameter. Safely writes by only modifying the 'project' and 'gist' hash
 * parameters, and leaving all other parameters untouched.
 *
 * @param gistId The ID of the gist to write to the url hash.
 */
const writeToHash = (gistId: string) => {
  const hashParams = deleteHashSearchParam('project');
  setHashSearchParam('gist', gistId, hashParams);
  window.location.hash = hashParams.toString();
};

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

    #gistActions {
      display: flex;
      justify-content: space-between;
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
  @property({attribute: false})
  getProjectFiles?: () => SampleFile[] | undefined;

  /**
   * Whether we're actively awaiting something like signing in or writing a
   * gist. The buttons should be disabled in that case.
   */
  @state()
  private _pending = false;

  /**
   * The gist we are currently viewing, if any.
   */
  @property({attribute: false})
  activeGist?: Gist;

  override render() {
    if (!this._signedInUser) {
      return this._signInButton;
    }
    return html`
      ${this._signedInStatus}
      <div id="gistActions">
        ${this.canUpdateGist ? this._updateGistButton : nothing}
        ${this._newGistButton}
      </div>
    `;
  }

  private get _signInButton() {
    return html`<litdev-icon-button
      id="signInButton"
      .disabled=${this._pending}
      @click=${this._signIn}
    >
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

  private get _newGistButton() {
    return html`<litdev-icon-button
      id="createNewGistButton"
      .disabled=${this._pending}
      @click=${this.createNewGist}
    >
      ${githubLogo} Create new gist
    </litdev-icon-button>`;
  }

  private get _updateGistButton() {
    return html`<litdev-icon-button
      id="updateGistButton"
      .disabled=${this._pending}
      @click=${this.updateGist}
    >
      ${githubLogo} Update gist
    </litdev-icon-button>`;
  }

  private get _signedInUser(): {id: number; login: string} | undefined {
    const value = localStorage.getItem(GITHUB_USER_LOCALSTORAGE_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return undefined;
  }

  get isSignedIn(): boolean {
    return this._signedInUser !== undefined;
  }

  get canUpdateGist(): boolean {
    if (!this.activeGist) {
      return false;
    }
    const user = this._signedInUser;
    if (!user) {
      return false;
    }
    return this.activeGist.owner.id === user.id;
  }

  @showErrors()
  private async _signIn() {
    this._pending = true;
    try {
      if (!this.githubApiUrl || !this.clientId || !this.authorizeUrl) {
        throw new Error('Missing required properties');
      }
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
    } finally {
      this._pending = false;
    }
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

  @showErrors()
  async createNewGist() {
    this._pending = true;
    try {
      if (!this.githubApiUrl) {
        throw new Error('Missing required properties');
      }
      const projectFiles = this.getProjectFiles?.();
      if (!projectFiles || projectFiles.length === 0) {
        // TODO(aomarks) The button should just be disabled in this case.
        throw new Error("Can't save an empty project");
      }

      this.dispatchEvent(
        new CustomEvent('status', {
          detail: {text: 'Creating gist ...'},
          bubbles: true,
        })
      );

      let token = tokenCache.get(this);
      if (token === undefined) {
        await this._signIn();
      }
      token = tokenCache.get(this);
      if (token === undefined) {
        throw new Error('Error token not defined');
      }

      const gistFiles = playgroundToGist(projectFiles);

      const gist = await createGist(gistFiles, {
        apiBaseUrl: this.githubApiUrl,
        token,
      });

      this.dispatchEvent(
        new Event('will-hashchange', {bubbles: true, composed: true})
      );
      writeToHash(gist.id);
      let statusText = 'Gist created';
      try {
        await navigator.clipboard.writeText(window.location.toString());
        statusText += ' and URL copied to clipboard';
      } catch {
        // The browser isn't allowing us to copy. This could happen because it's
        // disabled in settings, or because we're in a browser like Safari that
        // only allows copying from a synchronous event handler.
        statusText += ' and URL bar updated';
      }
      this.dispatchEvent(new Event('created'));
      this.dispatchEvent(
        new CustomEvent('status', {
          detail: {text: statusText},
          bubbles: true,
        })
      );
    } finally {
      this._pending = false;
    }
  }

  @showErrors()
  async updateGist() {
    this._pending = true;
    try {
      if (!this.githubApiUrl || !this.activeGist) {
        throw new Error('Missing required properties');
      }
      const projectFiles = this.getProjectFiles?.();
      if (!projectFiles || projectFiles.length === 0) {
        // TODO(aomarks) The button should just be disabled in this case.
        throw new Error("Can't save an empty project");
      }

      this.dispatchEvent(
        new CustomEvent('status', {
          detail: {text: 'Updating gist ...'},
          bubbles: true,
        })
      );

      let token = tokenCache.get(this);
      if (token === undefined) {
        await this._signIn();
      }
      token = tokenCache.get(this);
      if (token === undefined) {
        throw new Error('Error token not defined');
      }

      const gistFiles = playgroundToGist(projectFiles);

      // If we have deleted or renamed a file, then the old filename will no
      // longer be in our project files list. However, when updating a gist, if
      // you omit a file that existed in the previous revision, it will not be
      // automatically deleted. Instead, we need to add an explicit entry for the
      // file where the content is empty.
      for (const oldFilename of Object.keys(this.activeGist.files)) {
        if (!gistFiles[oldFilename]) {
          gistFiles[oldFilename] = {content: ''};
        }
      }

      const gist = await updateGist(this.activeGist.id, gistFiles, {
        apiBaseUrl: this.githubApiUrl,
        token,
      });

      this.dispatchEvent(
        new Event('will-hashchange', {bubbles: true, composed: true})
      );
      writeToHash(gist.id);
      let statusText = 'Gist updated';
      try {
        await navigator.clipboard.writeText(window.location.toString());
        statusText += ' and URL copied to clipboard';
      } catch {}
      this.dispatchEvent(new Event('created'));
      this.dispatchEvent(
        new CustomEvent('status', {
          detail: {text: statusText},
          bubbles: true,
        })
      );
    } finally {
      this._pending = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-share-gist': LitDevPlaygroundShareGist;
  }
}
