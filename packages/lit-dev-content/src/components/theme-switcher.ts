/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, isServer} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {
  getCurrentMode,
  applyColorThemeListeners,
  ColorMode,
} from '../global/theme.js';
import {autoModeIcon} from '../icons/auto-mode-icon.js';
import {darkModeIcon} from '../icons/dark-mode-icon.js';
import {lightModeIcon} from '../icons/light-mode-icon.js';
import './litdev-ripple-icon-button.js';

applyColorThemeListeners();

const Modes = {
  light: {
    icon: lightModeIcon,
    label: 'Light mode',
    title: 'Color Mode Toggle (light)',
  },
  dark: {
    icon: darkModeIcon,
    label: 'Dark mode',
    title: 'Color Mode Toggle (dark)',
  },
  auto: {
    icon: autoModeIcon,
    label: 'Match system mode',
    title: 'Color Mode Toggle (system)',
  },
} as const;

/**
 * A button that copies some text when clicked.
 */
@customElement('theme-switcher')
export class ThemeSwitcher extends LitElement {
  @property()
  mode: ColorMode = 'auto';

  render() {
    const modeOptions = Modes[this.mode];
    return html`<litdev-ripple-icon-button
      @click=${this._click}
      live="assertive"
      .label=${modeOptions.label}
      .buttonTitle=${modeOptions.title}
    >
      ${modeOptions.icon}
    </litdev-ripple-icon-button>`;
  }

  firstUpdated() {
    this.mode = getCurrentMode();
  }

  private _click() {
    let nextMode!: ColorMode;

    switch (this.mode) {
      case 'auto':
        nextMode = 'dark';
        break;
      case 'dark':
        nextMode = 'light';
        break;
      case 'light':
        nextMode = 'auto';
        break;
    }

    this.dispatchEvent(new ChangeColorModeEvent(nextMode));
    this.mode = nextMode;
  }
}

if (isServer) {
  if (!window) {
    window = {} as any;
  }

  if (!window.Event) {
    (window as any).Event = class {};
  }
}
/**
 * Requests the global theme listener change the theme due to a color change.
 */
class ChangeColorModeEvent extends window.Event {
  /**
   * @param color The new source color to apply.
   */
  constructor(public mode: 'light' | 'dark' | 'auto') {
    super('change-color-mode', {bubbles: true, composed: true});
  }
}

declare global {
  interface HTMLElementEventMap {
    'change-color-mode': ChangeColorModeEvent;
  }
}
