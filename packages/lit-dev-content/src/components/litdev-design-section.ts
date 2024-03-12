/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {tokens, defaultPalette} from '../util/colors.js';
import './lazy-svg.js';

@customElement('litdev-design-section')
export class LitDevDesignSection extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2em 3em;
      color: var(--sys-color-on-background);
    }

    #logo {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-block-end: 2em;
    }

    #palette {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    .item {
      width: 100px;
      height: 100px;
      padding: 24px;
      margin: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-radius: 24px;
      border: 1px solid var(--sys-color-outline);
    }

    #selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-block: 16px;
    }

    #controls {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `;

  @state() foreground = '--sys-color-on-primary-container';
  @state() background = '--sys-color-primary-container';

  render() {
    return html`
      <div id="logo">
        <lazy-svg
          loading="eager"
          href="/images/logo.svg#full"
          alt="Lit Dev Logo"
        ></lazy-svg>
      </div>
      <div id="selector">
        <div
          style=${styleMap({
            color: `var(${this.foreground})`,
            'background-color': `var(${this.background})`,
          })}
          class="item"
          id="sample-text"
          contenteditable
        >
          The quick brown fox jumps over the lazy dog.
        </div>
        <div id="controls">
          <label>
            Foreground:
            <select @change=${this.onForegroundChange}>
              ${tokens.map(
                (token) => html`
                  <option value=${token} ?selected=${this.foreground === token}>
                    ${token.replace('--sys-color-', '').replaceAll('-', ' ')}
                  </option>
                `
              )}
            </select>
          </label>

          <label>
            Background:
            <select @change=${this.onBackgroundChange}>
              ${tokens.map(
                (token) => html`
                  <option value=${token} ?selected=${this.background === token}>
                    ${token.replace('--sys-color-', '').replaceAll('-', ' ')}
                  </option>
                `
              )}
            </select>
          </label>
        </div>
      </div>
      <div id="palette">
        ${defaultPalette.map(
          (config) => html`
            <div
              class="item"
              style="color: var(${config.color}); background-color: var(${config.contrast});"
            >
              ${config.text}
            </div>
          `
        )}
      </div>
    `;
  }

  private onForegroundChange(e: Event) {
    this.foreground = (e.target as HTMLSelectElement).value;
  }

  private onBackgroundChange(e: Event) {
    this.background = (e.target as HTMLSelectElement).value;
  }
}
