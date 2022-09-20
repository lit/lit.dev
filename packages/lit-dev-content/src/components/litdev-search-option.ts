/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {hashtagIcon} from '../icons/hashtag-icon.js';
import {paperDocumentIcon} from '../icons/paper-document-icon.js';

/**
 * A single search option suggestion.
 */
@customElement('litdev-search-option')
export class LitdevSearchOption extends LitElement {
  @property()
  relativeUrl = '';

  @property()
  title = '';

  @property()
  heading = '';

  @property()
  text = '';

  @property({type: Boolean})
  isSubsection = false;

  @property({type: Boolean, attribute: true})
  checked = false;

  static get styles() {
    return [
      css`
        :host {
          display: block;
        }

        :host([checked]) :is(.suggestion, svg) {
          background-color: var(--color-blue);
          color: white;
        }

        .suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 50px;
          padding: 0.2em 0.5em;
          margin-block: 4px;
          border: 1px solid var(--color-medium-gray);
          background-color: white;
          font-size: 16px;
          cursor: pointer;
        }

        .title-and-text {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-inline-start: 8px;
        }

        .title,
        .text {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .title {
          font-weight: 600;
        }

        svg {
          color: var(--color-dark-gray);
        }

        em {
          color: var(--color-blue);
          font-style: normal;
          text-decoration: underline;
        }

        :host([checked]) .suggestion em {
          color: var(--color-cyan);
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="suggestion">
        <div aria-hidden="true">
          ${this.isSubsection ? hashtagIcon : paperDocumentIcon}
        </div>
        <div class="title-and-text">
          ${this.isSubsection
            ? html`<span class="title">${unsafeHTML(this.heading)}</span>
                <span class="text">${unsafeHTML(this.text)}</span>`
            : html`<span class="title">${unsafeHTML(this.title)}</span>`}
        </div>
      </div>
    `;
  }

  updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('checked') && this.checked) {
      this.scrollIntoView({
        block: 'nearest',
        inline: 'start',
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-search-option': LitdevSearchOption;
  }
}
