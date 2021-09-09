/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, property, state, PropertyValues} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import {PlaygroundProject} from 'playground-elements/playground-project.js';
import {manifest, TutorialStep} from './litdev-tutorial-manifest.js';
import {addModsParameterToUrlIfNeeded} from '../mods.js';
import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_PREFERENCE_EVENT_NAME,
} from '../code-language-preference.js';
import '@material/mwc-icon-button';
import './litdev-example-controls.js';

interface ExpandedTutorialStep extends TutorialStep {
  idx: number;
  url: string;
  htmlSrc: string;
  projectSrcBefore: string;
  projectSrcAfter: string;
}

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
  @state()
  private _idx = 0;

  /**
   * Whether the active step content is currently loading.
   */
  @state()
  private _loading = true;

  /**
   * The dynamically fetched HTML content to display.
   */
  @state()
  private _html?: string;

  /**
   * Preloaded HTML content for the next step (idx is explicit to ensure we
   * don't get out of sync).
   */
  @state()
  private _preloadedHtml?: {idx: number; promise: Promise<string>};

  /**
   * Whether the tutorial is currently in its "solved" state.
   */
  private _solved = false;

  createRenderRoot() {
    // This is a site-specific component, and we want to inherit site-wide
    // styles.
    return this;
  }

  render() {
    return html`
      <div id="tutorialHeader">
        <div>
          Step <span class="number">${this._idx + 1}</span> /
          <span class="number">${manifest.steps.length}</span>
        </div>

        <nav>
          <mwc-icon-button
            id="prevButton"
            label="Previous step"
            .disabled=${this._idx <= 0}
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
            .disabled=${this._idx >= manifest.steps.length - 1}
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

      <div
        id="tutorialContent"
        class="minimalScroller"
        ?loading=${this._loading}
      >
        <h1>${this._info?.title}</h1>
        ${unsafeHTML(this._html)}

        <div id="tutorialFooter">
          <button @click=${this._onClickSolve}>
            <!-- Source: https://material.io/resources/icons/?icon=auto_fix_high -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentcolor"
              aria-hidden="true"
            >
              <path
                d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z"
              />
            </svg>
            Solve
          </button>

          <button @click=${this._onClickReset}>
            <!-- Source: https://material.io/resources/icons/?icon=restart_alt -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentcolor"
              aria-hidden="true"
            >
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
            ${this._nextInfo
              ? html`Next:
                  <a href="" tabindex="0" @click=${this._onClickNextButton}
                    >${this._nextInfo.title}</a
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
    window.addEventListener(
      CODE_LANGUAGE_PREFERENCE_EVENT_NAME,
      this._onCodeLanguagePreferenceChanged
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._readUrl);
    window.removeEventListener(
      CODE_LANGUAGE_PREFERENCE_EVENT_NAME,
      this._onCodeLanguagePreferenceChanged
    );
  }

  private _onCodeLanguagePreferenceChanged = () => {
    // TODO(aomarks) If the user has modified the code, we should show a dialog
    // on the Playground along the lines of "Switching languages will lose your
    // changes [Accept] [Cancel]".
    this._setProjectSrc(
      this._solved ? this._info.projectSrcAfter : this._info.projectSrcBefore,
      true
    );
  };

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    if (changedProperties.has('_idx')) {
      this._loadStep();
    }
  }

  private _onClickSolve() {
    this._solved = true;
    this._setProjectSrc(this._info.projectSrcAfter, true);
  }

  private _onClickReset() {
    this._solved = false;
    this._setProjectSrc(this._info.projectSrcBefore);
  }

  private _onClickNextButton(event: Event) {
    event.preventDefault();
    if (this._idx < manifest.steps.length - 1) {
      this._idx++;
      this._writeUrl();
    }
  }

  private _onClickPrevButton(event: Event) {
    this._solved = false;
    event.preventDefault();
    if (this._idx > 0) {
      this._idx--;
      this._writeUrl();
    }
  }

  private get _project(): PlaygroundProject | undefined {
    if (!this.project) {
      return undefined;
    }
    return (this.getRootNode() as ShadowRoot | Document).getElementById(
      this.project
    ) as PlaygroundProject | undefined;
  }

  private get _info() {
    // Since we carefully control that this._idx is always a valid index, we can
    // assert not undefined here.
    return this._idxToInfo(this._idx)!;
  }

  private get _nextInfo() {
    return this._idxToInfo(this._idx + 1);
  }

  // Arrow function syntax so that we can remove listener on disconnect.
  private _readUrl = () => {
    let hash = window.location.hash;
    if (hash.startsWith('#')) {
      hash = hash.slice(1);
    }
    this._idx = hash === '' ? 0 : this._slugToIdx(hash) ?? this._idx;
  };

  private _writeUrl() {
    window.history.pushState(
      null,
      '',
      addModsParameterToUrlIfNeeded(this._info.url)
    );
  }

  private _setProjectSrc(src: string, force = false) {
    const project = this._project;
    if (project === undefined) {
      return;
    }
    if (force) {
      project.projectSrc = undefined;
    }
    project.projectSrc = src;
  }

  private async _loadStep() {
    this._loading = true;
    this._solved = false;
    const active = this._info;
    this._html =
      this._preloadedHtml?.idx === this._idx
        ? await this._preloadedHtml.promise
        : await this._fetchHtml(active.htmlSrc);
    this._setProjectSrc(active.projectSrcBefore);
    this._loading = false;
    // Use scrollTop instead of scrollIntoView, because scrollIntoView also
    // changes focus.
    this.renderRoot.querySelector('#tutorialContent')!.scrollTop = 0;

    // Start loading the next step's HTML content.
    const next = this._nextInfo;
    if (next !== undefined) {
      this._preloadedHtml = {
        idx: next.idx,
        promise: this._fetchHtml(next.htmlSrc),
      };
    }
  }

  private async _fetchHtml(src: string): Promise<string> {
    return (await fetch(src)).text();
  }

  private _slugToIdx(slug: string): number | undefined {
    const idx = manifest.steps.findIndex((step) => step.slug === slug);
    return idx === -1 ? undefined : idx;
  }

  private _idxToInfo(idx: number): ExpandedTutorialStep | undefined {
    const info = manifest.steps[idx];
    if (info === undefined) {
      return undefined;
    }
    const samplesRoot =
      getCodeLanguagePreference() === 'ts' ? '/samples' : '/samples/js';
    return {
      ...info,
      idx,
      url: idx === 0 ? `/tutorial/` : `/tutorial/#${info.slug}`,
      htmlSrc: `/tutorial/content/${info.slug}/`,
      projectSrcBefore: `${samplesRoot}/tutorial/${info.slug}/before/project.json`,
      projectSrcAfter: `${samplesRoot}/tutorial/${info.slug}/after/project.json`,
    };
  }
}

customElements.define('litdev-tutorial', LitDevTutorial);
