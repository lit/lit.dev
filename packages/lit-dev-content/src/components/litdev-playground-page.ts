/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/mwc-button';
import '@material/mwc-snackbar';
import 'playground-elements/playground-ide.js';
import '../components/litdev-example-controls.js';
import '../components/litdev-playground-change-guard.js';
import '../components/litdev-playground-share-button.js';
import '../components/litdev-playground-download-button.js';
import '../components/litdev-error-notifier.js';

import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';
import {getGist} from '../github/github-gists.js';
import {GitHubError} from '../github/github-util.js';
import {decodeSafeBase64} from '../util/safe-base64.js';
import {compactPlaygroundFile} from '../util/compact-playground-file.js';
import {LitDevError, showError} from '../errors.js';
import {gistToPlayground} from '../util/gist-conversion.js';

import type {LitDevPlaygroundShareButton} from './litdev-playground-share-button.js';
import type {LitDevPlaygroundDownloadButton} from './litdev-playground-download-button.js';
import type {LitDevDrawer} from './litdev-drawer.js';
import type {LitDevExampleControls} from './litdev-example-controls.js';
import type {PlaygroundProject} from 'playground-elements/playground-project.js';
import type {PlaygroundPreview} from 'playground-elements/playground-preview.js';
import type {PlaygroundFileEditor} from 'playground-elements/playground-file-editor.js';
import type {PlaygroundCodeEditor} from 'playground-elements/playground-code-editor.js';
import {
  deleteHashSearchParam,
  getHashSearchParam,
  getHashSearchParams,
  setHashSearchParam,
} from '../util/url-helpers.js';

interface CompactProjectFile {
  name: string;
  content: string;
  hidden?: true;
}

type ViewMode = 'split' | 'preview' | 'code';

// The hash param to look for in the url to determine whether we should display
// the preview in fullscreen.
const PLAYGROUND_FULLSCREEN_HASH_PARAM = 'view-mode';

/**
 * Top-level component for the Lit.dev Playground page.
 *
 * TODO(aomarks) This component is mid-refactoring. In particular, the way it
 * assumes and queries for child elements will be changing.
 */
@customElement('litdev-playground-page')
export class LitDevPlaygroundPage extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  private _playgroundProject!: PlaygroundProject;
  private _playgroundPreview!: PlaygroundPreview;
  private _fileEditor!: PlaygroundFileEditor;
  private _codeEditor!: PlaygroundCodeEditor;
  private _shareButton!: LitDevPlaygroundShareButton;
  private _downloadButton!: LitDevPlaygroundDownloadButton;
  private _examplesDrawer!: LitDevDrawer;
  private _examplesDrawerScroller!: HTMLElement;
  private _exampleControls!: LitDevExampleControls;
  private _hasUnsavedChanges = false;
  private _hashChangedByViewMode = false;

  /**
   * Base URL for the GitHub API.
   */
  @property()
  githubApiUrl!: string;

  @property({type: String, reflect: true, attribute: 'view-mode'})
  viewMode: ViewMode = 'split';

  async connectedCallback() {
    super.connectedCallback();
    this._checkRequiredParameters();
    await this._discoverChildElements();
    this._activateChildElements();
    this._syncStateFromUrlHash();
    window.addEventListener('hashchange', (e: HashChangeEvent) => {
      this._syncStateFromUrlHash(e);
    });
    window.addEventListener(CODE_LANGUAGE_CHANGE, () => {
      this._syncStateFromUrlHash();
    });
    this._codeEditor.addEventListener('change', this._onEditorChange);
    this._shareButton.addEventListener('save', this._onSaveEvent);
    this._shareButton.addEventListener('will-hashchange', this._onSaveEvent);
    window.addEventListener('beforeunload', this._beforeUnload);
  }

  render() {
    return html`<slot></slot>`;
  }

  firstUpdated(changed: PropertyValues<this>) {
    super.firstUpdated(changed);
    // toggle previewFullscreen when the fullscreen button is clicked
    const iconButton = this.querySelector('#view-mode-button');
    iconButton?.addEventListener('click', () => {
      const lastMode = this.viewMode;
      if (lastMode === 'split') {
        this.viewMode = 'preview';
      } else if (lastMode === 'preview') {
        this.viewMode = 'code';
      } else {
        this.viewMode = 'split';
      }
    });
  }

  update(changed: PropertyValues<this>) {
    const hashSearchParams = getHashSearchParams();
    // initialize viewMode on first update. Needs to happen before firstUpdated
    // so that we do not trigger `viewMode` change after first render.
    if (!this.hasUpdated) {
      // initialize previewFullscreen if `#playground-fullscreen=true`
      this.viewMode =
        (getHashSearchParam(
          PLAYGROUND_FULLSCREEN_HASH_PARAM,
          hashSearchParams
        ) as null | ViewMode) ?? 'split';
    } else if (changed.has('viewMode')) {
      // if previewFullscreen has changed, update the hash in the URL but not on
      // first render
      if (this.viewMode === 'code' || this.viewMode === 'preview') {
        setHashSearchParam(
          PLAYGROUND_FULLSCREEN_HASH_PARAM,
          this.viewMode,
          hashSearchParams
        );
      } else {
        deleteHashSearchParam(
          PLAYGROUND_FULLSCREEN_HASH_PARAM,
          hashSearchParams
        );
      }

      this._hashChangedByViewMode = true;
      window.location.hash = hashSearchParams.toString();
    }
    super.update(changed);
  }

  /**
   * When the code editor is changed, store that there are unsaved changes.
   */
  private _onEditorChange = () => {
    this._hasUnsavedChanges = true;
  };

  /**
   * When the user saves, reset the unsaved changes flag.
   */
  private _onSaveEvent = () => {
    this._hasUnsavedChanges = false;
  };

  /**
   * Shows a confirmation dialog if the user has unsaved changes
   */
  private _beforeUnload = (e: BeforeUnloadEvent): string | void => {
    if (this._hasUnsavedChanges) {
      // Show a confirmation popup before exit. The method seems to be
      // different per browser.
      (e || window.event).returnValue = 'non-void value';
      e.preventDefault();
      return 'non-void value';
    }

    // If there are no unsaved changes, then don't show the dialog.
  };

  private _checkRequiredParameters() {
    if (!this.githubApiUrl) {
      throw new Error('GitHub configuration parameter missing');
    }
  }

  private async _discoverChildElements() {
    // TODO(aomarks) This is very unconventional. We should be rendering these
    // elements ourselves, or slotting them in with names.
    const mustFindChild: typeof this['querySelector'] = (
      selector: string
    ): HTMLElement => {
      const el = this.querySelector(selector);
      if (el === null) {
        throw new Error(`Missing element ${selector}`);
      }
      return el as HTMLElement;
    };
    this._playgroundProject = mustFindChild('playground-project')!;
    this._playgroundPreview = mustFindChild('playground-preview')!;
    this._fileEditor = mustFindChild('playground-file-editor')!;
    this._shareButton = mustFindChild('litdev-playground-share-button')!;
    this._downloadButton = mustFindChild('litdev-playground-download-button')!;
    this._examplesDrawer = mustFindChild('litdev-drawer')!;
    this._exampleControls = mustFindChild('litdev-example-controls')!;
    this._examplesDrawerScroller = mustFindChild(
      'litdev-drawer .minimalScroller'
    )!;
    // Unforuntately, the file editor does not emit a change event, so we reach
    // into the shadow root and find the code editor that does.
    await this._fileEditor.updateComplete;
    this._codeEditor = this._fileEditor.shadowRoot!.querySelector(
      'playground-code-editor'
    )!;
  }

  private _activateChildElements() {
    this._shareButton.getProjectFiles = () => this._playgroundProject.files;

    // Clicks made on the playground-preview iframe will be handled entirely by
    // the iframe window, and don't propagate to the host window. That means
    // that the normal behavior where the share flyout detects clicks outside of
    // itself in order to close won't work, since it will never see the click
    // event. To work around this, we temporarily disable pointer-events on the
    // preview, so that clicks go to our host window instead.
    this._shareButton.addEventListener('opened', () => {
      this._playgroundPreview.style.pointerEvents = 'none';
    });
    this._shareButton.addEventListener('closed', () => {
      this._playgroundPreview.style.pointerEvents = 'unset';
    });

    this._downloadButton.getProjectFiles = () => this._playgroundProject.files;
  }

  private _loadBase64(base64: string): Array<CompactProjectFile> | undefined {
    if (base64) {
      try {
        const json = decodeSafeBase64(base64);
        try {
          return JSON.parse(json) as Array<CompactProjectFile>;
        } catch {
          console.error('Invalid JSON in URL', JSON.stringify(json));
        }
      } catch {
        console.error('Invalid project base64 in URL');
      }
    }
    return undefined;
  }

  private async _loadGist(gistId: string): Promise<Array<CompactProjectFile>> {
    const gist = await getGist(gistId, {apiBaseUrl: this.githubApiUrl});
    this._shareButton.activeGist = gist;
    return gistToPlayground(gist.files).map(compactPlaygroundFile);
  }

  private async _syncStateFromUrlHash(e?: HashChangeEvent) {
    if (this._hashChangedByViewMode) {
      this._hashChangedByViewMode = false;
      return;
    }

    let shouldExit = true;

    if (e && this._hasUnsavedChanges) {
      shouldExit = window.confirm('You have unsaved changes. Discard them?');
      this._hasUnsavedChanges = !shouldExit;
    }

    if (!shouldExit) {
      window.history.pushState(null, '', e!.oldURL);
      e?.preventDefault();
      return;
    }

    this.viewMode =
      (getHashSearchParam(
        PLAYGROUND_FULLSCREEN_HASH_PARAM
      ) as ViewMode | null) || 'split';
    let urlFiles: Array<CompactProjectFile> | undefined;
    const gist = getHashSearchParam('gist');
    const base64 = getHashSearchParam('project');
    if (this._shareButton.activeGist?.id !== gist) {
      // We're about to switch to a new gist, or to something that's not a gist
      // at all (a pre-made sample or a base64 project). Either way, the active
      // gist is now outdated.
      this._shareButton.activeGist = undefined;
    }
    if (gist) {
      try {
        urlFiles = await this._loadGist(gist);
      } catch (error: unknown) {
        if (error instanceof GitHubError && error.status === 404) {
          error = new LitDevError({
            heading: 'Gist not found',
            message: 'The given GitHub gist could not be found.',
            stack: (error as Error).stack,
          });
        }
        // TODO(aomarks) Use @showErrors decorator after refactoring this into a
        // component.
        showError(error);
      }
    } else if (base64) {
      urlFiles = this._loadBase64(base64);
    }
    this._examplesDrawer
      .querySelector('.exampleItem.active')
      ?.classList.remove('active');

    if (urlFiles) {
      this._hideCodeLanguageSwitch();
      this._playgroundProject.config = {
        extends: '/samples/base.json',
        files: Object.fromEntries(
          urlFiles.map(({name, content, hidden}) => [name, {content, hidden}])
        ),
      };
    } else {
      this._showCodeLanguageSwitch();
      let sample = 'examples/hello-world';
      const urlSample = getHashSearchParam('sample');
      if (urlSample?.match(/^[a-zA-Z0-9_\-\/]+$/)) {
        sample = urlSample;
      }
      const samplesRoot =
        getCodeLanguagePreference() === 'ts' ? '/samples' : '/samples/js';
      this._playgroundProject.projectSrc = `${samplesRoot}/${sample}/project.json`;

      const link = this._examplesDrawer.querySelector(
        `.exampleItem[data-sample="${sample}"]`
      );
      if (link) {
        link.classList.add('active');
        // Wait for the drawer to upgrade and render before scrolling.
        await customElements.whenDefined('litdev-drawer');
        requestAnimationFrame(() => {
          this._scrollToCenter(link, this._examplesDrawerScroller);
        });
      }
    }
  }

  /**
   * Set the opacity of the TypeScript/JavaScript language switch.
   *
   * When a Playground is comes from a base64-encoded project in the URL (i.e.
   * through the "Share" button), it's not possible to automatically translate
   * between JS and TS forms. Only pre-built TS samples have a generated JS
   * version available.
   */
  private _hideCodeLanguageSwitch() {
    this._exampleControls.hideCodeLanguageSwitch = true;
  }

  private _showCodeLanguageSwitch() {
    this._exampleControls.hideCodeLanguageSwitch = false;
  }

  /**
   * Note we don't use scrollIntoView() because it also steals focus.
   */
  private _scrollToCenter(target: Element, parent: Element) {
    const parentRect = parent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (
      targetRect.bottom > parentRect.bottom ||
      targetRect.top < parentRect.top
    ) {
      parent.scroll({
        top: targetRect.top - parentRect.top - parentRect.height / 2,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-page': LitDevPlaygroundPage;
  }
}
