/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/mwc-dialog';
import '@material/mwc-button';

import {html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {PlaygroundConnectedElement} from 'playground-elements/playground-connected-element.js';
import {
  BEFORE_CODE_LANGUAGE_CHANGE,
  setCodeLanguagePreference,
} from '../code-language-preference.js';

import type {CodeLanguagePreference} from '../code-language-preference.js';

/**
 * Prompts the user to continue or cancel if the global code language preference
 * is about to change and the associated Playground has been modified.
 */
@customElement('litdev-playground-change-guard')
export class LitDevPlaygroundChangeGuard extends PlaygroundConnectedElement {
  static styles = css`
    :host {
      --mdc-theme-primary: var(--color-blue);
    }
    p {
      /* The built-in mwc-dialog styles have a lot of padding above the action
         buttons which looks a bit odd here. This is a hacky way to reduce it,
         since mwc-dialog doesn't allow any padding adjustments. */
      margin-bottom: -10px;
    }
  `;

  override render() {
    if (!this._pendingLanguage) {
      return nothing;
    }
    return html`
      <mwc-dialog
        heading="Changes will be lost"
        open
        @closed=${this._onDialogClosed}
      >
        <p>
          The changes you made will be lost if you switch languages. Are you
          sure you want to continue?
        </p>
        <mwc-button slot="primaryAction" dialogAction="cancel">
          Cancel
        </mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="continue">
          Switch
        </mwc-button>
      </mwc-dialog>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      BEFORE_CODE_LANGUAGE_CHANGE,
      this._onBeforeCodeLanguageChange
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      BEFORE_CODE_LANGUAGE_CHANGE,
      this._onBeforeCodeLanguageChange
    );
  }

  @state()
  private _pendingLanguage: CodeLanguagePreference | undefined = undefined;

  private _onBeforeCodeLanguageChange = (
    event: WindowEventMap[typeof BEFORE_CODE_LANGUAGE_CHANGE]
  ) => {
    if (this._project?.modified) {
      event.detail.cancel();
      this._pendingLanguage = event.detail.pendingLanguage;
    }
  };

  private _onDialogClosed(
    event: CustomEvent<{action: 'cancel' | 'continue' | 'close'}>
  ) {
    if (
      event.detail.action === 'continue' &&
      this._pendingLanguage !== undefined
    ) {
      setCodeLanguagePreference(this._pendingLanguage, /* force */ true);
    }
    this._pendingLanguage = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-playground-change-guard': LitDevPlaygroundChangeGuard;
  }
}
