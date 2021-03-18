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

import {
  LitElement,
  html,
  property,
  internalProperty,
  PropertyValues,
} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import {PlaygroundProject} from 'playground-elements/playground-project.js';
import {manifest} from './tutorial-manifest.js';
import '@material/mwc-icon-button';

/**
 * Tutorial controller and text display.
 *
 * TODO(aomarks) Consider making a bit more generic and moving into
 * playground-elements.
 */
export class LitDevTutorial extends LitElement {
  /**
   * ID of the <playground-project> in the host scope whose project-src we'll
   * set when we change steps.
   */
  @property()
  project?: string;

  /**
   * The 0-indexed step that's currently active.
   */
  @internalProperty()
  private _currentStepIdx = 0;

  /**
   * The dynamically fetched HTML content to display.
   */
  @internalProperty()
  private _htmlContent?: string;

  createRenderRoot() {
    // This is a site-specific component, and we want to inherit site-wide
    // styles.
    return this;
  }

  render() {
    return html`
      <div id="tutorialHeader">
        <div>
          Step <span class="number">${this._currentStepIdx + 1}</span> /
          <span class="number">${manifest.steps.length}</span>
        </div>

        <nav>
          <mwc-icon-button
            id="prevButton"
            label="Previous step"
            .disabled=${this._currentStepIdx <= 0}
            @click=${this._onClickPrevButton}
          >
            <!-- Source: https://material.io/resources/icons/?icon=arrow_back -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </mwc-icon-button>

          <mwc-icon-button
            id="nextButton"
            label="Next step"
            .disabled=${this._currentStepIdx >= manifest.steps.length - 1}
            @click=${this._onClickNextButton}
          >
            <!-- Source: https://material.io/resources/icons/?icon=arrow_forward -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor">
              <path
                d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
              />
            </svg>
          </mwc-icon-button>
        </nav>
      </div>

      <div id="tutorialContent">
        <h1>${this._stepTitle}</h1>
        ${unsafeHTML(this._htmlContent)}

        <div id="tutorialFooter">
          <button @click=${this._onClickSolve}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor">
              <path
                d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z"
              />
            </svg>
            Solve
          </button>

          <button @click=${this._onClickReset}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor">
              <path
                d="M12,5V2L8,6l4,4V7c3.31,0,6,2.69,6,6c0,2.97-2.17,5.43-5,5.91v2.02c3.95-0.49,7-3.85,7-7.93C20,8.58,16.42,5,12,5z"
              />
              <path
                d="M6,13c0-1.65,0.67-3.15,1.76-4.24L6.34,7.34C4.9,8.79,4,10.79,4,13c0,4.08,3.05,7.44,7,7.93v-2.02 C8.17,18.43,6,15.97,6,13z"
              />
            </svg>
            Reset
          </button>

          <span id="nextStep">
            ${this._nextStepTitle
              ? html`Next:
                  <a href="" tabindex="0" @click=${this._onClickNextButton}
                    >${this._nextStepTitle}</a
                  >`
              : html`<em>Tutorial complete!</em>`}
          </span>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._readUrl();
    window.addEventListener('hashchange', this._readUrl);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._readUrl);
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    if (changedProperties.has('_currentStepIdx')) {
      this._loadStep();
    }
  }

  private _readUrl = () => {
    let hash = window.location.hash;
    if (hash.startsWith('#')) {
      hash = hash.slice(1);
    }
    if (hash === '') {
      this._currentStepIdx = 0;
    } else {
      const idx = manifest.steps.findIndex((step) => step.id === hash);
      if (idx >= 0) {
        this._currentStepIdx = idx;
      }
    }
  };

  private _writeUrl() {
    let newPath;
    if (this._currentStepIdx === 0) {
      newPath = '/tutorial/';
    } else {
      const stepId = this._stepId;
      if (!stepId) {
        return;
      }
      newPath = `/tutorial/#${stepId}`;
    }
    window.history.pushState(null, '', newPath);
  }

  private _setProjectSrc(src: string, force = false) {
    const stepId = this._stepId;
    if (!stepId) {
      return;
    }
    const project = this._project;
    if (project) {
      if (force) {
        project.projectSrc = undefined;
      }
      project.projectSrc = src;
    }
  }

  private _onClickSolve() {
    const stepId = this._stepId;
    if (!stepId) {
      return;
    }
    this._setProjectSrc(`/samples/tutorial/${stepId}/after/project.json`, true);
  }

  private _onClickReset() {
    const stepId = this._stepId;
    if (!stepId) {
      return;
    }
    this._setProjectSrc(
      `/samples/tutorial/${stepId}/before/project.json`,
      true
    );
  }

  private _onClickNextButton(event: Event) {
    event.preventDefault();
    if (this._currentStepIdx < manifest.steps.length - 1) {
      this._currentStepIdx++;
      this._writeUrl();
    }
  }

  private _onClickPrevButton() {
    if (this._currentStepIdx > 0) {
      this._currentStepIdx--;
      this._writeUrl();
    }
  }

  private async _loadStep() {
    const stepId = this._stepId;
    if (!stepId) {
      return;
    }
    const htmlUrl = `/tutorial/content/${stepId}/`;
    this._setProjectSrc(`/samples/tutorial/${stepId}/before/project.json`);
    const result = await fetch(htmlUrl);
    this._htmlContent = await result.text();
  }

  private get _stepId(): string | undefined {
    return manifest.steps[this._currentStepIdx]?.id;
  }

  private get _stepTitle(): string | undefined {
    return manifest.steps[this._currentStepIdx]?.title;
  }

  private get _nextStepTitle(): string | undefined {
    return manifest.steps[this._currentStepIdx + 1]?.title;
  }

  private get _project(): PlaygroundProject | undefined {
    if (!this.project) {
      return undefined;
    }
    return (this.getRootNode() as ShadowRoot | Document).getElementById(
      this.project
    ) as PlaygroundProject | undefined;
  }
}

customElements.define('litdev-tutorial', LitDevTutorial);
