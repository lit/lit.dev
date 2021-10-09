/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {signInToGithub} from '../github/github-signin.js';
import {createGist} from '../github/github-gists.js';

import type {GistFiles} from '../github/github-gists.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';

/**
 * An in-memory cache of the GitHub authentication tokens associated with each
 * instance of a share button. This allows the user to authenticate only once
 * per page load, instead of on each save.
 *
 * By using a WeakMap instead of a class instance property, we make it much more
 * difficult for code outside of this module to directly access tokens.
 *
 * (It's not expected to usually have more than one instance of a share button,
 * but it could happen e.g. in testing.)
 */
const tokenCache = new WeakMap<LitDevGitHubShareButton, string>();

/**
 * A button that shares a Playground project as a GitHub gist. If the user isn't
 * signed into GitHub yet, they are prompted to do so.
 *
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
    return html`<button @click=${this._onClick}>Share with GitHub</button>`;
  }

  private async _onClick() {
    const projectFiles = this.getProjectFiles?.();
    if (
      !this.githubApiUrl ||
      !this.clientId ||
      !this.authorizeUrl ||
      !projectFiles
    ) {
      throw new Error('Missing required properties');
    }
    if (projectFiles.length === 0) {
      // TODO(aomarks) The button should just be disabled in this case.
      throw new Error("Can't save an empty project");
    }

    let token = tokenCache.get(this);
    if (token === undefined) {
      // TODO(aomarks) User facing error if this fails.
      token = await signInToGithub({
        clientId: this.clientId,
        authorizeUrl: this.authorizeUrl,
      });
      tokenCache.set(this, token);
    }

    const gistFiles: GistFiles = Object.fromEntries(
      projectFiles.map((file) => [file.name, {content: file.content}])
    );

    // TODO(aomarks) User facing error if this fails.
    const gistId = await createGist(gistFiles, {
      apiBaseUrl: this.githubApiUrl,
      token,
    });
    const event: HTMLElementEventMap['gist-created'] = new CustomEvent(
      'gist-created',
      {detail: {gistId}}
    );
    this.dispatchEvent(event);
  }
}

declare global {
  interface HTMLElementEventMap {
    'gist-created': CustomEvent<{gistId: string}>;
  }
  interface HTMLElementTagNameMap {
    'litdev-github-share-button': LitDevGitHubShareButton;
  }
}
