/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import './litdev-icon-button.js';
import './litdev-flyout.js';
import './copy-button.js';

import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {compactPlaygroundFile} from '../util/compact-playground-file.js';
import {encodeSafeBase64} from '../util/safe-base64.js';

import type {SampleFile} from 'playground-elements/shared/worker-api.js';
import {
  deleteHashSearchParam,
  setHashSearchParam,
} from '../util/url-helpers.js';

/**
 * A text box and button for copying a long base64-encoded Playground project
 * URL.
 */
@customElement('litdev-playground-share-long-url')
export class LitDevPlaygroundShareLongUrl extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      align-items: center;
      display: flex;
    }
    input {
      height: 24px;
      min-width: 50px;
      width: 275px;
    }
    copy-button {
      color: #3e3e3e;
      margin: 0 -5px 0 10px;
      opacity: 0.75;
    }
    copy-button:hover {
      opacity: 1;
    }
  `;

  /**
   * A function to allow this component to access the project upon save.
   */
  getProjectFiles?: () => SampleFile[] | undefined;

  /**
   * Full URL containing the base64 encoded playground files.
   */
  @state()
  _url = '';

  /**
   * Generate the base64 encoded URL from the latest playground files.
   */
  generateUrl(): void {
    const files = this.getProjectFiles?.();
    if (!files || files.length === 0) {
      // TODO(aomarks) Show an error
      console.error("Can't save empty project");
      return;
    }
    const base64 = encodeSafeBase64(
      JSON.stringify(files.map(compactPlaygroundFile))
    );
    // We have to use these util functions so that we do not accidentally
    // overwrite any existing query parameters in the hash like `#view-mode=...`
    const hashParams = deleteHashSearchParam('gist');
    setHashSearchParam('project', base64, hashParams);
    this._url = new URL(`#${hashParams}`, window.location.href).href;
  }

  override render() {
    return html`
      <input type="text" disabled .value=${this._url} />
      <copy-button .text=${this._url} @click=${this.save}></copy-button>
    `;
  }

  /**
   * Pushes the current long url onto the history, attempts to save it to the
   * clipboard, and notifies with the copied and status events.
   *
   * @param options Options to skip saving to the clipboard.
   */
  async save() {
    history.pushState({}, '', this._url);
    let statusText;
    try {
      await navigator.clipboard.writeText(window.location.toString());
      statusText = 'URL copied to clipboard';
    } catch {
      // The browser isn't allowing us to copy. This could happen because it's
      // disabled in settings, or because we're in a browser like Safari that
      // only allows copying from a synchronous event handler.
      statusText += 'URL bar updated';
    }
    this.dispatchEvent(new Event('copied'));
    this.dispatchEvent(
      new CustomEvent('status', {
        detail: {text: statusText},
        bubbles: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-share-long-url': LitDevPlaygroundShareLongUrl;
  }
}
