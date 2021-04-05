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

import {LitElement, html, css, property, internalProperty} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined.js';
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
      font-family: var(--playground-code-font-family, monospace);
      font-size: var(--playground-code-font-size, inherit);
    }

    playground-file-editor:not(:first-of-type) {
      height: var(--litdev-example-editor-n-height, 100px);
    }

    playground-preview {
      margin: 0 0.5px;
      height: var(--litdev-example-preview-height, 100px);
      border-top: var(--code-border);
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
      background: var(--playground-code-background);
      bottom: calc(var(--litdev-example-preview-height) - 24px - 16px);
      right: 16px;
      color: inherit;
      z-index: 2;
      opacity: 70%;
    }

    .openInPlayground:hover {
      opacity: 100%;
    }

    .divider {
      border-bottom: var(--code-divider-border, 0);
      margin: var(--code-divider-margin, 0);
      height: 0;
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

  @property({type: Boolean})
  hidePlayground = false;

  @property({type: Boolean})
  hasFallbackContent = false;

  @internalProperty()
  private _outputReady = false;

  render() {
    /* TOOD(sorvell): When fallback content is provided, a slot is rendered and
      the main output is hidden until CodeMirror renders it. There doesn't appear
      to be a good signal for this right now and a timeout is used in `updated`.
    */
    const canRender = this.project && this.filename && (!this.hasFallbackContent || this._outputReady);
    const files = (this.filename || '').split(/\s*,\s*/);
    const content = html`<playground-project
    id="project"
    project-src="/samples/${ifDefined(this.project)}/project.json"
  >
  </playground-project>

  ${files.map((file, i) => html`<playground-file-editor project="project" filename="${file}">
  </playground-file-editor>${i < files.length-1 ? html`<div class="divider"></div>` : ''}`)}

  <div class="divider"></div>
  <playground-preview project="project"> </playground-preview>

  ${!this.hidePlayground ? html`<a
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
  </a>` : ''}`;
    return html`${!this.hasFallbackContent ? content : html`
      ${canRender ? '' : html`<slot></slot>`}
      <div ?hidden="${!canRender}">${content}</div>`}`;
  }

  async updated() {
    if (!this.hasFallbackContent) {
      return;
    }
    if (this.project && this.filename && !this._outputReady) {
      // TODO(sorvell): playground-editor waits some amount of time before
      // displaying and does not fire an event when ready.
      await new Promise((r) => setTimeout(r, 1000));
      this._outputReady = true;
    }
  }
}

customElements.define('litdev-example', LitDevExample);
