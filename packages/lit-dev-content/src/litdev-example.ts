/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {LitElement, html, css, property} from 'lit-element';
import {nothing} from 'lit-html';
import 'playground-elements/playground-ide.js';

/**
 * Embedded playground code example in vertical layout.
 */
export class LitDevExample extends LitElement {
  static styles = css`
    :host {
      display: block;
      /* For absolute positioning of openInPlayground button. */
      position: relative;
      border-radius: none;
    }

    playground-file-editor,
    playground-preview {
      border-radius: 5px;
      box-sizing: border-box;
    }

    playground-file-editor {
      border: 1px solid transparent;
      height: var(--litdev-example-editor-height, 300px);
      margin-bottom: 0;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      background: var(--playground-code-background);
      /* TODO(aomarks) Should be in the playground styles */
      line-height: var(--playground-code-line-height);
      padding: var(--playground-code-padding);
    }

    playground-preview {
      border: 1px solid #ccc;
      margin: 0 0.5px;
      height: var(--litdev-example-preview-height, 100px);
      border-top: none;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    playground-preview::part(preview-toolbar) {
      /* TODO(aomarks) The toolbar should be a separate element altogether. Then
         we can just omit rendering it. */
      display: none;
    }

    .openInPlayground {
      position: absolute;
      bottom: calc(var(--litdev-example-preview-height) - 24px - 16px);
      right: 16px;
      color: inherit;
      z-index: 2;
      opacity: 70%;
    }

    .openInPlayground:hover {
      opacity: 100%;
    }
  `;

  /**
   * Path to the project dir from `samples/PATH/project.json`.
   */
  @property()
  project?: string;

  /**
   * Name of file in project to display.
   */
  @property()
  filename?: string;

  render() {
    if (!this.project || !this.filename) {
      return nothing;
    }
    return html`
      <playground-project
        id="project"
        project-src="/samples/${this.project}/project.json"
      >
      </playground-project>

      <playground-file-editor project="project" filename="${this.filename}">
      </playground-file-editor>

      <playground-preview project="project"> </playground-preview>

      <a
        class="openInPlayground"
        title="Open this example in the playground"
        target="_blank"
        href="/playground/#sample=${this.project}"
      >
        <!-- Source: https://material.io/resources/icons/?icon=launch&style=baseline -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor">
          <path
            d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
          />
        </svg>
      </a>
    `;
  }
}

customElements.define('litdev-example', LitDevExample);
