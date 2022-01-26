/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import {PlaygroundProject} from 'playground-elements/playground-project.js';
import {addModsParameterToUrlIfNeeded} from '../mods.js';
import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';
import {solveIcon} from '../icons/solve-icon.js';
import {resetIcon} from '../icons/reset-icon.js';
import {catalogIcon} from '../icons/catalog-icon.js';
import {forwardArrowIcon} from '../icons/forward-arrow-icon.js';
import {backArrowIcon} from '../icons/back-arrow-icon.js';

import '@material/mwc-icon-button';
import './litdev-example-controls.js';
import './litdev-playground-change-guard.js';
import './litdev-icon-button.js';
import {Task, TaskStatus} from '@lit-labs/task';

export interface TutorialStep {
  title: string;
}

export interface TutorialManifest {
  steps: TutorialStep[];
}

interface ExpandedTutorialStep {
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
   * Whether or not to display the catalog back button.
   *
   * TODO(e111077): remove once we decide to go public with the catalog
   */
  @property({type: Boolean, attribute: 'show-catalog-button'})
  showCatalogButton = false;

  /**
   * Whether or not the forwards and back button should point to
   * /tutorial(s/tutorial-name)
   *
   * TODO(e111077): remove once we decide to go public with the catalog
   */
  @property({type: Boolean, attribute: 'use-old-url'})
  useOldUrl = false;

  /**
   * The 0-indexed step that's currently active.
   */
  @state()
  private _idx = 0;

  /**
   * Preloaded HTML content for the next step (idx is explicit to ensure we
   * don't get out of sync).
   */
  @state()
  private _preloadedHtml?: {idx: number; promise: Promise<string>};

  /**
   * Tutorial manifest json file
   */
  private get _manifest(): TutorialManifest {
    return this._manifestTask.value ?? {steps: [{title: ''}]};
  }

  /**
   * Whether the tutorial is currently in its "solved" state.
   */
  private _solved = false;

  private get _projectLocation() {
    // TODO(e111077): delete this once we go public with tutorials catalog
    if (window.location.pathname === '/tutorial/') {
      return 'intro-to-lit';
    }
    return window.location.pathname.replace('/tutorials/', '');
  }

  /**
   * Playground project element discovered using the id from this.project
   */
  private get _project(): PlaygroundProject | undefined {
    if (!this.project) {
      return undefined;
    }
    return (this.getRootNode() as ShadowRoot | Document).getElementById(
      this.project
    ) as PlaygroundProject | undefined;
  }

  /**
   * Generates an info from the _idx. May result in a 404 request if the index
   * does not result in an actual file location
   */
  private get _info() {
    return this._idxToInfo(this._idx);
  }

  /**
   * Info for the next step. May result in a 404 request if the index + 1
   * does not result in an actual file location
   */
  private get _nextInfo() {
    return this._idxToInfo(this._idx + 1);
  }

  /**
   * The root URI of the samples directory based on language preference.
   */
  private get _samplesRoot() {
    return getCodeLanguagePreference() === 'ts' ? '/samples' : '/samples/js';
  }

  /**
   * Last resolved value of the manifest task.
   */
  private _oldManifestValue: TutorialManifest | undefined = undefined;

  /**
   * Fetches the tutorial manifest on _projectLocation change
   */
  private _manifestTask = new Task(
    this,
    async ([projectLocation]) => {
      const manifestRes = await fetch(
        `${this._samplesRoot}/tutorials/${projectLocation}/tutorial.json`
      );

      return (await manifestRes.json()) as TutorialManifest;
    },
    () => [this._projectLocation]
  );

  /**
   * Last resolved value of the html task.
   */
  private _oldHtmlValue: string | undefined = undefined;

  /**
   * Fetches the HTML-rendered markdown tutorial text on _idx change.
   */
  private _htmlTask = new Task(
    this,
    async ([idx]) => {
      this._solved = false;
      const active = this._info;

      // Either use the preloaded html or fetch the new HTML (going back)
      const html =
        this._preloadedHtml?.idx === idx
          ? await this._preloadedHtml.promise
          : await this._fetchHtml(active.htmlSrc);

      return html;
    },
    () => [this._idx]
  );

  createRenderRoot() {
    // This is a site-specific component, and we want to inherit site-wide
    // styles.
    return this;
  }

  willUpdate(): void {
    const manifestTaskValue = this._manifestTask.value;

    /**
     * When the manifest task has just finished resolving, read the URL
     */
    if (
      manifestTaskValue !== undefined &&
      this._oldManifestValue !== manifestTaskValue
    ) {
      this._oldManifestValue = manifestTaskValue;
      this._readUrl();
    }

    const htmlTaskValue = this._htmlTask.value;

    /**
     * When the html task has just finished resolving fetch the next step's html
     */
    if (htmlTaskValue !== undefined && this._oldHtmlValue !== htmlTaskValue) {
      this._oldHtmlValue = htmlTaskValue;
      this._setProjectSrc(this._info.projectSrcBefore);
      // Use scrollTop instead of scrollIntoView, because scrollIntoView also
      // changes focus.
      const contentNode = this.renderRoot?.querySelector('#tutorialContent');
      if (contentNode) {
        contentNode.scrollTop = 0;
      }

      // Start loading the next step's HTML content. If it's in bounds.
      // We can generally assume _manifest is loaded by now. If not,
      // we'll just fetch it normally anyway when it's active
      if (this._idx + 1 < this._manifest.steps.length - 1) {
        const next = this._nextInfo;
        this._preloadedHtml = {
          idx: next.idx,
          promise: this._fetchHtml(next.htmlSrc),
        };
      }
    }
  }

  render() {
    return html`${this.renderHeader()}${this.renderContent()}`;
  }

  protected renderHeader() {
    return html`<div
      id="tutorialHeader"
      class=${this.showCatalogButton ? 'hasCatalogButton' : ''}
    >
      <div class="lhs">
        ${when(
          this.showCatalogButton,
          () => html`
            <a href="/tutorials/" tabindex="-1">
              <mwc-icon-button aria-label="Tutorial Catalog">
                ${catalogIcon}
              </mwc-icon-button>
            </a>
          `
        )}
        <span>
          ${this._manifestTask.render({
            complete: (manifest) => html`Step
              <span class="number">${this._idx + 1}</span>
              / <span class="number">${manifest.steps.length}</span>`,
          })}
        </span>
      </div>

      ${this.renderHeaderNav()}
    </div>`;
  }

  protected renderHeaderNav() {
    return html`<nav>
      <mwc-icon-button
        id="prevButton"
        aria-label="Previous step"
        .disabled=${this._idx <= 0}
        @click=${this._onClickPrevButton}
      >
        ${backArrowIcon}
      </mwc-icon-button>

      <mwc-icon-button
        id="nextButton"
        aria-label="Next step"
        .disabled=${this._idx >= this._manifest.steps.length - 1}
        @click=${this._onClickNextButton}
      >
        ${forwardArrowIcon}
      </mwc-icon-button>
    </nav>`;
  }

  protected renderContent() {
    return html`<div
      id="tutorialContent"
      class="minimalScroller"
      ?loading=${this._htmlTask.status === TaskStatus.PENDING ||
      this._htmlTask.status === TaskStatus.INITIAL}
    >
      <h1>
        ${when(
          this._idx < this._manifest.steps.length,
          () => this._manifest.steps[this._idx].title
        )}
      </h1>
      ${this._htmlTask.render({
        complete: (description) => html`${unsafeHTML(description)}`,
      })}
      ${this.renderFooter()}
    </div>`;
  }

  protected renderFooter() {
    return html`<div id="tutorialFooter">
      <litdev-icon-button @click=${this._onClickSolve}>
        ${solveIcon} Solve
      </litdev-icon-button>

      <litdev-icon-button @click=${this._onClickReset}>
        ${resetIcon} Reset
      </litdev-icon-button>

      <span id="nextStep">
        ${this._idx + 1 < this._manifest.steps.length
          ? html`Next:
              <a href="" tabindex="0" @click=${this._onClickNextButton}
                >${this._manifest.steps[this._idx + 1].title}</a
              >`
          : html`<em>Tutorial complete!</em>`}
      </span>
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._readUrl);
    window.addEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._readUrl);
    window.removeEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );
  }

  private _onCodeLanguagePreferenceChanged = () => {
    if (!this._info) {
      return;
    }

    this._setProjectSrc(
      this._solved ? this._info.projectSrcAfter : this._info.projectSrcBefore,
      true
    );
  };

  private _onClickSolve() {
    if (!this._info) {
      return;
    }

    this._solved = true;
    this._setProjectSrc(this._info.projectSrcAfter, true);
  }

  private _onClickReset() {
    if (!this._info) {
      return;
    }

    this._solved = false;
    this._setProjectSrc(this._info.projectSrcBefore, true);
  }

  private _onClickNextButton(event: Event) {
    event.preventDefault();
    if (this._idx < this._manifest.steps.length - 1) {
      this._idx++;
      this._writeUrl();
    }
  }

  private _onClickPrevButton(event: Event) {
    event.preventDefault();
    if (this._idx > 0) {
      this._idx--;
      this._writeUrl();
    }
  }

  // Arrow function syntax so that we can remove listener on disconnect.
  /**
   * Reads the hash and calculates the _idx
   */
  private _readUrl = () => {
    let hash = window.location.hash;
    if (hash.startsWith('#')) {
      hash = hash.slice(1);
    }
    this._idx = hash === '' ? 0 : this._slugToIdx(hash) ?? this._idx;
  };

  /**
   * Sets the URL and history to the current _info's URL
   */
  private _writeUrl() {
    if (!this._info) {
      return;
    }

    window.history.pushState(
      null,
      '',
      addModsParameterToUrlIfNeeded(this._info.url)
    );
  }

  /**
   * Sets the projectSrc on the given <playground-project> queried by
   * this._project.
   *
   * @param src src to be set on the <playground-project>
   * @param force force a change in <playground-project>'s projectSrc
   */
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

  /**
   * Fetches the text of a file. Typically expected to be the rendered HTML of
   * the markdown tutorial step descriptions
   *
   * @param src URL to fetch
   * @returns stringified text of the file at the given location
   */
  private async _fetchHtml(src: string): Promise<string> {
    return (await fetch(src)).text();
  }

  /**
   * Finds the index of the given slug. e.g. "" -> 0, "03" -> 3
   *
   * @param slug slug of the step
   * @returns The index with the given slug
   */
  private _slugToIdx(slug: string): number | undefined {
    const idx = Number(slug);
    return isNaN(idx) ? undefined : idx;
  }

  /**
   * Generates a formatted object of data relevant to this tutorial for the
   * given step index.
   *
   * @param idx Step index to load
   * @returns A formatted info object of the given step. 404s if the step
   *   does not exist in the file system
   */
  private _idxToInfo(idx: number): ExpandedTutorialStep {
    const slug = `${idx}`.length == 1 ? `0${idx}` : `${idx}`;

    const firstUrl = this.useOldUrl
      ? '/tutorial/'
      : `/tutorials/${this._projectLocation}`;

    const nextUrl = this.useOldUrl
      ? `/tutorial/#${slug}`
      : `/tutorials/${this._projectLocation}#${slug}`;

    return {
      idx,
      url: idx === 0 ? firstUrl : nextUrl,
      htmlSrc: `/tutorials/content/${this._projectLocation}/${slug}/`,
      projectSrcBefore: `${this._samplesRoot}/tutorials/${this._projectLocation}/${slug}/before/project.json`,
      projectSrcAfter: `${this._samplesRoot}/tutorials/${this._projectLocation}/${slug}/after/project.json`,
    };
  }
}

customElements.define('litdev-tutorial', LitDevTutorial);
