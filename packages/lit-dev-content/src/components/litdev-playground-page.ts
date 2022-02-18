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

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';
import {getGist} from '../github/github-gists.js';
import {GitHubError} from '../github/github-util.js';
import {encodeSafeBase64, decodeSafeBase64} from '../util/safe-base64.js';
import {compactPlaygroundFile} from '../util/compact-playground-file.js';
import {modEnabled} from '../mods.js';
import {LitDevError, showError} from '../errors.js';
import {gistToPlayground} from '../util/gist-conversion.js';

import type {Snackbar} from '@material/mwc-snackbar';
import type {LitDevPlaygroundShareButton} from './litdev-playground-share-button.js';
import type {LitDevPlaygroundDownloadButton} from './litdev-playground-download-button.js';
import type {LitDevDrawer} from './litdev-drawer.js';
import type {LitDevExampleControls} from './litdev-example-controls.js';
import type {PlaygroundProject} from 'playground-elements/playground-project.js';
import type {PlaygroundPreview} from 'playground-elements/playground-preview.js';

interface CompactProjectFile {
  name: string;
  content: string;
  hidden?: true;
}

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
  private _shareButton!: HTMLElement;
  private _shareSnackbar!: Snackbar;
  private _newShareButton!: LitDevPlaygroundShareButton;
  private _downloadButton!: LitDevPlaygroundDownloadButton;
  private _examplesDrawer!: LitDevDrawer;
  private _examplesDrawerScroller!: HTMLElement;
  private _exampleControls!: LitDevExampleControls;

  /**
   * Base URL for the GitHub API.
   */
  @property()
  githubApiUrl!: string;

  connectedCallback() {
    super.connectedCallback();
    this._checkRequiredParameters();
    this._discoverChildElements();
    this._activateChildElements();
    this._syncStateFromUrlHash();
    window.addEventListener('hashchange', () => this._syncStateFromUrlHash());
    window.addEventListener(CODE_LANGUAGE_CHANGE, () =>
      this._syncStateFromUrlHash()
    );
    this._activateKeyboardShortcuts();
  }

  render() {
    return html`<slot></slot>`;
  }

  private _checkRequiredParameters() {
    if (!this.githubApiUrl) {
      throw new Error('GitHub configuration parameter missing');
    }
  }

  private _discoverChildElements() {
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
    this._shareButton = mustFindChild('#shareButton')!;
    this._shareSnackbar = mustFindChild('#shareSnackbar')!;
    this._newShareButton = mustFindChild('litdev-playground-share-button')!;
    this._downloadButton = mustFindChild('litdev-playground-download-button')!;
    this._examplesDrawer = mustFindChild('litdev-drawer')!;
    this._exampleControls = mustFindChild('litdev-example-controls')!;
    this._examplesDrawerScroller = mustFindChild(
      'litdev-drawer .minimalScroller'
    )!;
  }

  private _activateChildElements() {
    this._newShareButton.getProjectFiles = () => this._playgroundProject.files;

    // Clicks made on the playground-preview iframe will be handled entirely by
    // the iframe window, and don't propagate to the host window. That means
    // that the normal behavior where the share flyout detects clicks outside of
    // itself in order to close won't work, since it will never see the click
    // event. To work around this, we temporarily disable pointer-events on the
    // preview, so that clicks go to our host window instead.
    this._newShareButton.addEventListener('opened', () => {
      this._playgroundPreview.style.pointerEvents = 'none';
    });
    this._newShareButton.addEventListener('closed', () => {
      this._playgroundPreview.style.pointerEvents = 'unset';
    });

    this._shareButton.addEventListener('click', () => this._share());
    this._downloadButton.getProjectFiles = () => this._playgroundProject.files;
  }

  private async _share() {
    const files = (this._playgroundProject.files ?? []).map(
      compactPlaygroundFile
    );
    const base64 = encodeSafeBase64(JSON.stringify(files));
    window.location.hash = '#project=' + base64;
    await navigator.clipboard.writeText(window.location.toString());
    this._shareSnackbar.open = true;
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
    if (this._newShareButton) {
      this._newShareButton.activeGist = gist;
    }
    return gistToPlayground(gist.files).map(compactPlaygroundFile);
  }

  private async _syncStateFromUrlHash() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    let urlFiles: Array<CompactProjectFile> | undefined;
    const gist = params.get('gist');
    const base64 = params.get('project');
    if (this._newShareButton.activeGist?.id !== gist) {
      // We're about to switch to a new gist, or to something that's not a gist
      // at all (a pre-made sample or a base64 project). Either way, the active
      // gist is now outdated.
      this._newShareButton.activeGist = undefined;
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
      const urlSample = params.get('sample');
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
   * Trigger URL sharing when Control-s or Command-s is pressed.
   */
  private _activateKeyboardShortcuts() {
    if (modEnabled('gists')) {
      // The new gists mode uses another component to handle keyboard shortcuts.
      return;
    }
    let controlDown = false;
    let commandDown = false;
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Control') {
        controlDown = true;
      } else if (event.key === 'Meta') {
        commandDown = true;
      } else if (event.key === 's' && (controlDown || commandDown)) {
        this._share();
        event.preventDefault(); // Don't trigger "Save page as"
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.key === 'Control') {
        controlDown = false;
      } else if (event.key === 'Meta') {
        commandDown = false;
      }
    });
    window.addEventListener('blur', () => {
      controlDown = false;
      commandDown = false;
    });
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
