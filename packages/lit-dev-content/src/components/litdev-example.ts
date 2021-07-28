/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, property} from 'lit-element';
import {styleMap} from 'lit-html/directives/style-map';
import {nothing} from 'lit-html';
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
    playground-preview,
    playground-tab-bar {
      border-radius: 5px;
      box-sizing: border-box;
    }

    playground-tab-bar {
      background: #fff;
      font-family: 'Open Sans', sans-serif;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: var(--code-border);
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
      padding: var(--litdev-code-padding);
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
   * If no file is provided, we show the tab-bar with all project files.
   */
  @property()
  filename?: string;

  /**
   * Base URL for script execution sandbox.
   */
  @property({attribute: 'sandbox-base-url'})
  sandboxBaseUrl?: string;

  render() {
    if (!this.project) {
      return nothing;
    }
    const showTabBar = !this.filename;
    // Only the top element should have a border radius.
    const fileEditorOverrideStyles = {
      borderRadius: showTabBar ? 'unset' : 'inherit',
    };

    return html`
      <playground-project
        sandbox-base-url=${ifDefined(this.sandboxBaseUrl)}
        id="project"
        project-src="/samples/${this.project}/project.json"
      >
      </playground-project>

      ${showTabBar
        ? html`<playground-tab-bar
            project="project"
            editor="project-file-editor"
          ></playground-tab-bar>`
        : nothing}

      <playground-file-editor
        id="project-file-editor"
        project="project"
        filename="${ifDefined(this.filename)}"
        style=${styleMap(fileEditorOverrideStyles)}
      >
      </playground-file-editor>

      <playground-preview project="project"></playground-preview>

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
