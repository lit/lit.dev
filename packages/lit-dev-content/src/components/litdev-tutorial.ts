/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, nothing} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {when} from 'lit/directives/when.js';
import {PlaygroundProject} from 'playground-elements/playground-project.js';
import {addModsParameterToUrlIfNeeded} from '../mods.js';
import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';
import {diamondIcon} from '../icons/diamond-icon.js';
import {solveIcon} from '../icons/solve-icon.js';
import {resetIcon} from '../icons/reset-icon.js';
import {catalogIcon} from '../icons/catalog-icon.js';
import {forwardArrowIcon} from '../icons/forward-arrow-icon.js';
import {backArrowIcon} from '../icons/back-arrow-icon.js';
import {checkFailedIcon} from '../icons/check-failed-icon.js';
import {checkPassedIcon} from '../icons/check-passed-icon.js';
import {checkCodeIcon} from '../icons/check-code-icon.js';
import {loopIcon} from '../icons/loop-icon.js';

import '@material/mwc-icon-button';
import '@material/mwc-snackbar';
import type {Snackbar} from '@material/mwc-snackbar';
import './litdev-example-controls.js';
import './litdev-playground-change-guard.js';
import './litdev-icon-button.js';
import {Task, TaskStatus} from '@lit-labs/task';
import {PostDoc} from 'postdoc-lib';
import type {PlaygroundPreview} from 'playground-elements/playground-preview';

const CHECK_TIMEOUT_MS = 10000;
export interface TutorialStep {
  title: string;
  hasAfter?: boolean;
  noSolve?: boolean;
  checkable?: boolean;
}

export interface TutorialManifest {
  header: string;
  steps: TutorialStep[];
}

interface ExpandedTutorialStep {
  idx: number;
  url: string;
  htmlSrc: string;
  projectSrcBefore: string;
  projectSrcAfter: string;
}

type CheckStatus = 'INDETERMINATE' | 'CHECKING' | 'PASSED' | 'FAILED';

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
   * ID of the <playground-preview> in the host scope whose iframe we must
   * access in order to communicate to and from the playground.
   */
  @property()
  preview?: string;

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
  private _preloadedHtml?: {
    idx: number;
    promise: Promise<string>;
  };

  /**
   * The current status of the code check
   */
  @state() private _checkStatus: CheckStatus = 'INDETERMINATE';

  /**
   * The message returned by the code check to display on the success or error
   * snackbar.
   */
  @state() private _validationMessage = '';

  @query('mwc-snackbar') private snackbar!: Snackbar;

  /**
   * Timeout ID for the code check timeout timer.
   */
  private _currentCheckTimeout: number | undefined;

  /**
   * Tutorial manifest json file
   */
  private get _manifest(): TutorialManifest {
    return this._manifestTask.value ?? {header: '', steps: [{title: ''}]};
  }

  /**
   * Whether the user has requested the solved code by clicking the "Solve"
   * button. Resets to false when the user clicks the "Reset" button or if they
   * change the page. Used to disable the "Check" code button.
   */
  @state() private _requestSolvedCode = false;

  /**
   * Receives check status messages from the playground and updates the check
   * UI accordingly.
   *
   * @param e Message event from the playground. Has status and possible
   *     validation message
   */
  private readonly onPlaygroundMessage = (
    e: MessageEvent<{status: string; message?: string}>
  ) => {
    if (this._checkStatus !== 'CHECKING') {
      return;
    }

    const {status, message} = e.data;
    this._validationMessage = message ?? '';

    switch (status) {
      // show snackbar success
      case 'PASSED':
        this._checkStatus = 'PASSED';
        this.snackbar.show();
        break;
      // show snackbar error
      case 'FAILED':
        this._checkStatus = 'FAILED';
        this.snackbar.show();
        break;
      // the preview has reloaded in the middle of checking. Reset the UI.
      case 'READY':
        this._checkStatus = 'INDETERMINATE';
        break;
    }

    this._clearCheckingTimeout();
  };

  /**
   * Utility library that communicates with the playground iframe.
   */
  private postdoc = new PostDoc({
    messageReceiver: window,
    onMessage: this.onPlaygroundMessage,
  });

  private get _projectLocation() {
    // TODO(e111077): delete this once we go public with tutorials catalog
    if (window.location.pathname === '/tutorial/') {
      return 'intro-to-lit';
    }
    const locationEnding = window.location.pathname.replace('/tutorials/', '');
    return locationEnding.replace(/\/$/, '');
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
   * Playground preview element discovered using the id from this.preview
   */
  private get _preview(): PlaygroundPreview | undefined {
    if (!this.preview) {
      return undefined;
    }
    return (this.getRootNode() as ShadowRoot | Document).getElementById(
      this.preview
    ) as PlaygroundPreview | undefined;
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

      if (manifestRes.ok) {
        return (await manifestRes.json()) as TutorialManifest;
      } else {
        throw new Error('Manifest fetch was unsuccessful');
      }
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
      this._requestSolvedCode = false;
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

    // TODO(e111077): clean up willUpdate depending on how
    // https://github.com/lit/lit/issues/2454 resolves

    // When the manifest task has just finished resolving, read the URL
    if (
      manifestTaskValue !== undefined &&
      this._oldManifestValue !== manifestTaskValue
    ) {
      this._oldManifestValue = manifestTaskValue;
      this._readUrl();
    }

    const htmlTaskValue = this._htmlTask.value;

    // When the html task has just finished resolving fetch the next step's html
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
        <span class="tutorial-metadata">
          ${this._manifestTask.render({
            complete: (manifest) => html` <span class="tutorial-title"
                >${manifest?.header}</span
              >
              <span class="title-separator">${diamondIcon}</span>
              <span class="step-text">Step</span>
              <span class="number">${this._idx + 1}</span>
              / <span class="number">${manifest?.steps.length}</span>`,
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
      ${this._manifestTask.render({
        // TODO(e111077): Move these error messages out of content and into
        // a toast or dialog
        error: () =>
          html`${`Could not fetch tutorial manifest. Invalid URL /${this._projectLocation}/`}<br />`,
      })}
      ${this._htmlTask.render({
        error: () =>
          html`${`Could not fetch step description. Invalid URL /${
            this._projectLocation
          }/#${this._idxToSlug(this._idx)}`}`,
        complete: (response) => html`${unsafeHTML(response)}`,
      })}
      ${this.renderFooter()}
    </div>`;
  }

  protected renderFooter() {
    const snackbarLabel = `The code has ${
      this._checkStatus === 'PASSED' ? 'passed' : 'failed'
    } the checks${
      this._validationMessage ? ` – ${this._validationMessage}` : '.'
    }`;

    return html`<div id="tutorialFooter">
        ${when(
          !this._manifest.steps[this._idx].noSolve,
          () => html`<litdev-icon-button @click=${this._onClickSolve}>
            ${solveIcon} Solve
          </litdev-icon-button>`
        )}
        ${this._manifestTask.render({
          complete: (manifest) => this._renderCodeCheckButton(manifest),
        })}

        <litdev-icon-button @click=${this._onClickReset}>
          ${resetIcon} Reset
        </litdev-icon-button>

        <span id="nextStep"> ${this._renderNextStepStatus()} </span>
      </div>
      <mwc-snackbar .labelText=${snackbarLabel}></mwc-snackbar>`;
  }

  private _renderCodeCheckButton(manifest: TutorialManifest) {
    if (!manifest.steps[this._idx].checkable) {
      return nothing;
    }

    const checkingClass = this._checkStatus === 'CHECKING' ? 'checking' : '';
    const isDisabled =
      this._checkStatus === 'CHECKING' || this._requestSolvedCode;

    return html`<litdev-icon-button
      class="checkButton ${checkingClass}"
      @click=${this._onClickCheck}
      ?disabled=${isDisabled}
    >
      ${this._renderCheckIcon()} Check
    </litdev-icon-button>`;
  }

  private _renderCheckIcon() {
    switch (this._checkStatus) {
      case 'INDETERMINATE':
        return checkCodeIcon;
      case 'CHECKING':
        return loopIcon;
      case 'PASSED':
        return checkPassedIcon;
      case 'FAILED':
        return checkFailedIcon;
    }
  }

  private _renderNextStepStatus() {
    if (
      this._htmlTask.status === TaskStatus.ERROR ||
      this._manifestTask.status !== TaskStatus.COMPLETE ||
      this._manifest.steps.length < this._idx + 1
    ) {
      return nothing;
    }

    if (this._idx + 1 === this._manifest.steps.length) {
      return html`<em>Tutorial complete!</em>`;
    }

    return html`Next:
      <a href="" tabindex="0" @click=${this._onClickNextButton}
        >${this._manifest.steps[this._idx + 1].title}</a
      >`;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._readUrl);
    window.addEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );

    const previewElement = this._preview!;
    // must be lowercase or else always undefined
    const tagname = previewElement.tagName.toLowerCase();
    const isPreviewDefined = !!customElements.get(tagname);

    if (isPreviewDefined) {
      this._whenPreviewDefined();
    } else {
      customElements.whenDefined(tagname).then(() => {
        this._whenPreviewDefined();
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._readUrl);
    window.removeEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguagePreferenceChanged
    );

    const iframe = this._preview!.iframe!;
    iframe.removeEventListener('load', this._onPreviewIFrameLoad);
  }

  /**
   * Called when the preview element is defined and sets an event listener on
   * the preview's internal iframe that sets up postdoc on each load.
   */
  private async _whenPreviewDefined() {
    const preview = this._preview!;
    await preview.updateComplete;
    const iframe = preview.iframe!;
    iframe.addEventListener('load', this._onPreviewIFrameLoad);
  }

  /**
   * Sets up postdoc with the preview iframe and clears any pending check
   * timeouts.
   *
   * @param e Load event from iframe
   */
  private _onPreviewIFrameLoad = (e: Event) => {
    const iframe = e.target as HTMLIFrameElement;
    this.postdoc.messageTarget = iframe.contentWindow;
    this._clearCheckingTimeout();
  };

  private _onCodeLanguagePreferenceChanged = () => {
    if (!this._info) {
      return;
    }

    this._setProjectSrc(
      this._requestSolvedCode
        ? this._info.projectSrcAfter
        : this._info.projectSrcBefore,
      true
    );
  };

  private _onClickSolve() {
    if (!this._info) {
      return;
    }

    this._checkStatus = 'PASSED';
    this._clearCheckingTimeout();
    this._requestSolvedCode = true;
    this._setProjectSrc(this._info.projectSrcAfter, true);
  }

  private _clearCheckingTimeout() {
    clearTimeout(this._currentCheckTimeout);
    this._currentCheckTimeout = undefined;
  }

  private async _onClickCheck() {
    this._checkStatus = 'CHECKING';

    // Set a timeout to fail the check if it takes too long.
    this._currentCheckTimeout = setTimeout(async () => {
      this._checkStatus = 'FAILED';
      this._validationMessage = 'The check has timed out!';
      this.snackbar.show();
    }, CHECK_TIMEOUT_MS) as unknown as number;

    await this.postdoc.handshake;
    // request to run the code checker in the playground preview
    this.postdoc.postMessage('CHECK');
  }

  private _onClickReset() {
    if (!this._info) {
      return;
    }

    this._checkStatus = 'INDETERMINATE';
    this._requestSolvedCode = false;
    this._setProjectSrc(this._info.projectSrcBefore, true);
  }

  private _onClickNextButton(event: Event) {
    event.preventDefault();
    if (this._idx < this._manifest.steps.length - 1) {
      this._checkStatus = 'INDETERMINATE';
      this._clearCheckingTimeout();
      this._idx++;
      this._writeUrl();
    }
  }

  private _onClickPrevButton(event: Event) {
    event.preventDefault();
    if (this._idx > 0) {
      this._checkStatus = 'INDETERMINATE';
      this._clearCheckingTimeout();
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
    const response = await fetch(src);

    if (!response.ok) {
      throw new Error('HTML fetch was unsuccessful');
    }

    return await response.text();
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
   * Turns an index into a 2-length stringified number for the slug.
   * @param idx index to slugify
   * @returns A 2-length stringified number
   */
  private _idxToSlug(idx: number): string {
    return `${idx}`.padStart(2, '0');
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
    const slug = this._idxToSlug(idx);
    // The "after"'s code is located in the before dir of the next step
    let afterSlug = `${this._idxToSlug(idx + 1)}/before`;

    // if the user specified this step has an after, use that
    if (this._manifest.steps[idx].hasAfter) {
      afterSlug = `${slug}/after`;
    }

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
      projectSrcAfter: `${this._samplesRoot}/tutorials/${this._projectLocation}/${afterSlug}/project.json`,
    };
  }
}

customElements.define('litdev-tutorial', LitDevTutorial);
