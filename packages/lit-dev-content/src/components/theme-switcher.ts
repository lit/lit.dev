/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, isServer, css, PropertyValues} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import {
  getCurrentMode,
  applyColorThemeListeners,
  ColorMode,
} from '../global/theme.js';
import {autoModeIcon} from '../icons/auto-mode-icon.js';
import {darkModeIcon} from '../icons/dark-mode-icon.js';
import {lightModeIcon} from '../icons/light-mode-icon.js';
import {checkIcon} from '../icons/check-icon.js';
import './litdev-ripple-icon-button.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import {FocusState, type CloseMenuEvent} from '@material/web/menu/menu.js';
import {isElementInSubtree} from '@material/web/menu/internal/controllers/shared.js';

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
    label: 'System',
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

  @state()
  menuOpen = false;

  @state()
  defaultFocus: FocusState = FocusState.NONE;

  render() {
    const modeOptions = Modes[this.mode];
    return html`
      <litdev-ripple-icon-button
        @click=${() => {
          this.menuOpen = !this.menuOpen;
        }}
        @keydown=${this._handleKeydown}
        label="Theme selector"
        haspopup="listbox"
        .expanded=${this.menuOpen ? 'true' : 'false'}
        controls="menu"
        button-role="combobox"
        .buttonTitle=${modeOptions.title}
        id="button"
      >
        <span aria-label=${modeOptions.label}>${modeOptions.icon()}</span>
      </litdev-ripple-icon-button>
      <md-menu
        id="menu"
        anchor="button"
        tabindex="-1"
        role="listbox"
        stay-open-on-focusout
        .open=${this.menuOpen}
        .defaultFocus=${this.defaultFocus}
        @opening=${() => {
          this.shadowRoot
            ?.querySelector?.('#button span')
            ?.removeAttribute?.('aria-live');
        }}
        @opened=${() => {
          if (this.defaultFocus !== FocusState.NONE) {
            return;
          }

          (
            this.shadowRoot?.querySelector?.(
              'md-menu-item[selected]',
            ) as HTMLElement
          )?.focus?.();
        }}
        @closed=${() => {
          this.menuOpen = false;
        }}
        @close-menu=${this._onCloseMenu}
      >
        ${Object.keys(Modes).map(
          (mode) => html`
            <md-menu-item
              aria-selected=${mode === this.mode ? 'true' : 'false'}
              ?selected=${mode === this.mode}
              data-mode=${mode}
            >
              <span slot="headline">${Modes[mode as ColorMode].label}</span>
              ${Modes[mode as ColorMode].icon('start')}
              ${mode === this.mode
                ? checkIcon('end')
                : html`<span slot="end"></span>`}
            </md-menu-item>
          `,
        )}
      </md-menu>
    `;
  }

  update(changed: PropertyValues<this>) {
    if (changed.get('mode')) {
      this.dispatchEvent(new ChangeColorModeEvent(this.mode));
    }

    super.update(changed);
  }

  firstUpdated() {
    this.mode = getCurrentMode();
    this.addEventListener('focusout', this._focusout);
  }

  private _onCloseMenu(e: CloseMenuEvent) {
    const nextMode = e.detail.itemPath[0]?.dataset?.mode as
      | ColorMode
      | undefined;
    if (!nextMode) {
      return;
    }

    this.mode = nextMode;
  }

  /**
   * Handles opening the select on keydown and typahead selection when the menu
   * is closed. Taken from md-select's implementation.
   */
  private _handleKeydown(event: KeyboardEvent) {
    const menu = this.shadowRoot?.querySelector?.('md-menu');

    if (this.menuOpen || !menu) {
      return;
    }

    const typeaheadController = menu.typeaheadController;
    const isOpenKey =
      event.code === 'Space' ||
      event.code === 'ArrowDown' ||
      event.code === 'ArrowUp' ||
      event.code === 'End' ||
      event.code === 'Home' ||
      event.code === 'Enter';

    // Do not open if currently typing ahead because the user may be typing the
    // spacebar to match a word with a space
    if (!typeaheadController.isTypingAhead && isOpenKey) {
      event.preventDefault();
      this.menuOpen = true;

      // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/#kbd_label
      switch (event.code) {
        case 'Space':
        case 'ArrowDown':
        case 'Enter':
          // We will handle focusing last selected item in this.handleOpening()
          this.defaultFocus = FocusState.NONE;
          break;
        case 'End':
          this.defaultFocus = FocusState.LAST_ITEM;
          break;
        case 'ArrowUp':
        case 'Home':
          this.defaultFocus = FocusState.FIRST_ITEM;
          break;
        default:
          break;
      }
      return;
    }

    const isPrintableKey = event.key.length === 1;

    // Handles typing ahead when the menu is closed by delegating the event to
    // the underlying menu's typeaheadController
    if (isPrintableKey) {
      typeaheadController.onKeydown(event);
      event.preventDefault();

      const {lastActiveRecord} = typeaheadController;

      if (!lastActiveRecord) {
        return;
      }

      const labelEl = this.shadowRoot?.querySelector?.('#button span');

      labelEl?.setAttribute?.('aria-live', 'polite');
      this.mode = lastActiveRecord[1].dataset.mode as ColorMode;
    }
  }

  /**
   * Handles closing the menu when the focus leaves the select's subtree.
   * Taken from md-select's implementation.
   */
  private _focusout(event: FocusEvent) {
    // Don't close the menu if we are switching focus between menu,
    // select-option, and field
    if (event.relatedTarget && isElementInSubtree(event.relatedTarget, this)) {
      return;
    }

    this.menuOpen = false;
  }

  static override styles = css`
    :host {
      position: relative;
      --md-sys-color-primary: var(--sys-color-primary);
      --md-sys-color-surface: var(--sys-color-surface);
      --md-sys-color-on-surface: var(--sys-color-on-surface);
      --md-sys-color-on-surface-variant: var(--sys-color-on-surface-variant);
      --md-sys-color-surface-container: var(--sys-color-surface-container);
      --md-sys-color-secondary-container: var(--sys-color-primary-container);
      --md-sys-color-on-secondary-container: var(
        --sys-color-on-primary-container
      );
      --md-focus-ring-color: var(--sys-color-secondary);
    }

    md-menu-item[selected] {
      --md-focus-ring-color: var(--sys-color-secondary-container);
    }

    md-menu {
      min-width: 0px;
    }

    #button > span {
      display: flex;
    }

    [slot='end'],
    [slot='start'] {
      width: 24px;
      height: 24px;
    }

    :host([desktop]) {
      --md-menu-item-label-text-size: 0.9em;
      --md-menu-item-one-line-container-height: 40px;
      --md-menu-item-top-space: 8px;
      --md-menu-item-bottom-space: 8px;
      --md-menu-item-label-text-line-height: 24px;
    }

    :host([desktop]) [slot='start'],
    :host([desktop]) [slot='end'] {
      width: 20px;
      height: 20px;
    }

    [slot='headline'] {
      font-family: Manrope, sans-serif;
      text-wrap: nowrap;
    }
  `;
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
