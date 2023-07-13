/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import '@material/mwc-dialog';
import '@material/mwc-button';

import type {LitDevError} from '../errors.js';

/**
 * Displays dismissable alerts about lit.dev errors.
 */
@customElement('litdev-error-notifier')
export class LitDevErrorNotifier extends LitElement {
  /**
   * The SHA or version number identifying the version of lit.dev, used for
   * error reports.
   */
  @property()
  siteVersion?: string;

  @state()
  private _error?: LitDevError;

  private _everHadErrors = false;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('error', this._onError);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('error', this._onError);
  }

  override render() {
    if (!this._everHadErrors) {
      return nothing;
    }
    return html`<mwc-dialog
      .open=${this._error !== undefined}
      .heading=${this._error?.heading ?? ''}
      @closed=${this._onClosed}
    >
      <p>${this._error?.message ?? ''}</p>
      <p>
        If you keep encountering this error, please file an issue at
        <a href="${this._reportUrl}" target="_blank" rel="noopener"
          >github.com/lit/lit.dev/issues</a
        >
      </p>
      <mwc-button dialogAction="ok" slot="primaryAction">OK</mwc-button>
    </mwc-dialog>`;
  }

  private get _reportUrl(): string {
    if (!this._error) {
      return '';
    }
    const url = new URL('https://github.com/lit/lit.dev/issues/new');
    url.searchParams.set('title', `Error: ${this._error.heading ?? 'unknown'}`);
    url.searchParams.set(
      'body',
      `
I encountered the following error on lit.dev:

> ${this._error.heading}
> ${this._error.message}

Stack trace:
\`\`\`
${this._error.stack}
\`\`\`

URL: ${document.location.href}
Site version: \`${this.siteVersion}\`
Browser: \`${navigator.userAgent}\`

<!-- Please add any additional information here. -->
`
    );
    return url.href;
  }

  private readonly _onError = (event: CustomEvent<LitDevError>) => {
    this._error = event.detail;
    this._everHadErrors = true;
  };

  private _onClosed() {
    this._error = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-error-notifier': LitDevErrorNotifier;
  }
}
