/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {downloadIcon} from '../icons/download-icon.js';
import Tar from 'tarts';

import './litdev-icon-button.js';

import type {SampleFile} from 'playground-elements/shared/worker-api.js';

/**
 * A button that prompts the user to download a playground project as a tarball.
 *
 * // TODO(aomarks) Support zip files.
 */
@customElement('litdev-playground-download-button')
export class LitDevPlaygroundDownloadButton extends LitElement {
  static styles = css`
    litdev-icon-button:hover {
      background: blue;
    }
  `;

  /**
   * A function to allow this component to access the project upon download.
   */
  getProjectFiles?: () => SampleFile[] | undefined;

  override render() {
    return html`
      <litdev-icon-button @click=${this._onClick}>
        ${downloadIcon} Download
      </litdev-icon-button>
    `;
  }

  private async _onClick() {
    const projectFiles = this.getProjectFiles?.();
    if (!projectFiles) {
      throw new Error('Missing required properties');
    }
    if (projectFiles.length === 0) {
      // TODO(aomarks) The button should just be disabled in this case.
      throw new Error("Can't download an empty project");
    }
    const tarFiles = projectFiles.map(({name, content}) => ({
      name,
      content: content ?? '',
    }));
    const tar = Tar(tarFiles);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([tar], {type: 'application/tar'}));
    a.download = 'lit-playground.tar';
    a.click();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-download-button': LitDevPlaygroundDownloadButton;
  }
}
