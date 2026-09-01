/**
 * @license
 * Copyright The Lit Project
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, isServer, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {
  COLOR_MODE_CHANGE_EVENT,
  getCurrentMode,
  initializeTheme,
  setColorMode,
  ColorMode,
} from '../global/theme.js';
import {darkModeIcon} from '../icons/dark-mode-icon.js';
import {lightModeIcon} from '../icons/light-mode-icon.js';
import './litdev-ripple-icon-button.js';

/**
 * An icon button that toggles between light and dark color modes.
 */
@customElement('theme-switcher')
export class ThemeSwitcher extends LitElement {
  @property({reflect: true})
  mode?: ColorMode;

  render() {
    return html`
      <litdev-ripple-icon-button
        @click=${this._toggleMode}
        label="Dark mode"
        .pressed=${this.mode ? this.mode === 'dark' : undefined}
        button-title="Toggle dark mode"
      >
        <span class="mode-icon light-mode">${lightModeIcon()}</span>
        <span class="mode-icon dark-mode">${darkModeIcon()}</span>
      </litdev-ripple-icon-button>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (isServer) {
      return;
    }

    initializeTheme();
    this.mode = getCurrentMode();
    window.addEventListener(
      COLOR_MODE_CHANGE_EVENT,
      this._handleColorModeChange
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (isServer) {
      return;
    }

    window.removeEventListener(
      COLOR_MODE_CHANGE_EVENT,
      this._handleColorModeChange
    );
  }

  private readonly _handleColorModeChange = (event: Event) => {
    this.mode = (event as CustomEvent<ColorMode>).detail;
  };

  private _toggleMode() {
    setColorMode(this.mode === 'dark' ? 'light' : 'dark');
  }

  static override styles = css`
    .mode-icon {
      display: none;
    }

    :host(:not([mode])) .light-mode,
    :host([mode='light']) .light-mode,
    :host([mode='dark']) .dark-mode {
      display: flex;
    }

    @media (prefers-color-scheme: dark) {
      :host(:not([mode])) .light-mode {
        display: none;
      }

      :host(:not([mode])) .dark-mode {
        display: flex;
      }
    }
  `;
}
