/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';
import 'playground-elements/playground-ide.js';
import './litdev-example-controls.js';

/**
 * Embedded playground code example in vertical layout.
 */
export class LitDevExample extends LitElement {
  static styles = css`
    :host {
      display: block;
      /* Move the border-bottom from the host to the iframe. Iframes will have a
      white background (by default), which will clip any host border slightly.
      */
      border-bottom: none !important;
    }

    #bar {
      display: flex;
      height: var(--litdev-example-bar-height);
    }

    /* With tabs */
    :host(:not([filename])) > #bar {
      border-bottom: var(--code-border);
    }

    /* Without tabs */
    :host([filename]) > #bar {
      background: var(--playground-code-background);
    }
    :host([filename]) > #bar > litdev-example-controls {
      padding-top: 6px;
    }
    :host([filename]) > playground-file-editor {
      /* Top padding is unnecessary because the same-background toolbar already
      provides a bunch of visual space at the top.*/
      padding-top: 0;
    }

    #bar,
    playground-tab-bar,
    playground-file-editor,
    playground-preview {
      border-radius: 5px;
      box-sizing: border-box;
    }

    playground-tab-bar {
      background-color: var(--sys-color-surface-high);
      font-family: 'Open Sans', sans-serif;
      height: var(--litdev-example-tab-bar-height);
      /* Allow the tab bar to shrink below its content size so that when an
      example is very narrow the tab bar shrinks and scrolls instead of pushing
      the controls outside the parent. */
      min-width: 0;
    }

    litdev-example-controls {
      height: var(--litdev-example-controls-height);
      padding-right: 6px;
      box-sizing: border-box;
      z-index: 1;
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
      border-bottom: var(--code-border);
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    playground-preview::part(preview-toolbar) {
      /* TODO(aomarks) The toolbar should be a separate element altogether. Then
         we can just omit rendering it. */
      display: none;
    }
  `;

  /**
   * Path to the project dir from `samples/PATH/project.json`.
   */
  @property()
  project?: string;

  /**
   * Whether to load the project on intersection with the viewport.
   */
  @property({type: Boolean})
  lazy = false;

  /**
   * Whether or not to load the project. Setting Lazy to true will re-initialize
   * this value to `false`. We would want to do this so that we do not load the
   * large TS worker file until the user has scrolled to the example. This is
   * something we would want to do if we want to have the server cache the
   * worker. Otherwise every example on the page would load the worker at the
   * same time and none of them would be cached.
   */
  @state()
  private loadProject = true;

  /**
   * Name of file in project to display.
   * If no file is provided, we show the tab-bar with all project files.
   */
  @property({reflect: true})
  filename?: string;

  /**
   * Base URL for script execution sandbox.
   */
  @property({attribute: 'sandbox-base-url'})
  sandboxBaseUrl?: string;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );
  }

  private _onCodeLanguagePreferenceChanged = () => {
    this.requestUpdate();
  };

  willUpdate() {
    if (!this.hasUpdated) {
      this.loadProject = !this.lazy;
    }
  }

  render() {
    if (!this.project) {
      return nothing;
    }
    const showTabBar = !this.filename;
    // Only the top element should have a border radius.
    const fileEditorOverrideStyles = {
      borderRadius: showTabBar ? 'unset' : 'inherit',
    };

    const mode = getCodeLanguagePreference();
    const projectSrc =
      mode === 'ts'
        ? `/samples/${this.project}/project.json`
        : `/samples/js/${this.project}/project.json`;
    const filename =
      mode === 'ts' ? this.filename : this.filename?.replace(/.ts$/, '.js');

    return html`
      ${this.loadProject
        ? // We need to conditionally render this because playground-project
          // will load its serviceworker on firstUpdated
          html`<playground-project
            sandbox-base-url=${ifDefined(this.sandboxBaseUrl)}
            id="project"
            project-src=${projectSrc}
          >
          </playground-project>`
        : nothing}

      <div id="bar">
        ${showTabBar
          ? html`<playground-tab-bar
              project=${this.loadProject
                ? 'project'
                : (nothing as unknown as string)}
              editor="project-file-editor"
            ></playground-tab-bar>`
          : nothing}

        <litdev-example-controls
          .project=${this.project}
        ></litdev-example-controls>
      </div>

      <playground-file-editor
        id="project-file-editor"
        project=${this.loadProject ? 'project' : (nothing as unknown as string)}
        filename="${ifDefined(filename)}"
        style=${styleMap(fileEditorOverrideStyles)}
      >
      </playground-file-editor>

      <playground-preview
        project=${this.loadProject ? 'project' : (nothing as unknown as string)}
      ></playground-preview>
    `;
  }

  firstUpdated() {
    if (this.lazy) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.loadProject = true;
            io.disconnect();
          }
        },
        {
          rootMargin: '40px',
        }
      );

      io.observe(this);
    }
  }
}

customElements.define('litdev-example', LitDevExample);
