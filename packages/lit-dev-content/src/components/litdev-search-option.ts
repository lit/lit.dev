/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {hashtagIcon} from '../icons/hashtag-icon.js';
import {paperDocumentIcon} from '../icons/paper-document-icon.js';
import {openInNewIcon} from '../icons/open-in-new-icon.js';
import {renderAlgoliaSnippet} from '../util/render-algolia-suggestions.js';

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

  @property({type: Boolean})
  isExternal = false;

  static styles = css`
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
      padding: 12px 20px;
      margin-block: 10px;
      background-color: white;
      font-size: 20px;
      cursor: pointer;
      border-radius: 4px;
    }

    .icon-wrapper {
      display: flex;
      height: 100%;
      align-items: center;
    }

    .title-and-text {
      overflow: hidden;
      display: flex;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      margin-inline-start: 20px;
      height: 50px;
    }

    .title-and-text.has-text {
      justify-content: space-between;
    }

    .title,
    .text {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .text {
      font-size: 14px;
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
      color: var(--color-white);
    }
  `;

  render() {
    const showText = this.isSubsection || (this.isExternal && this.text);
    return html`
      <div class="suggestion">
        <div class="icon-wrapper" aria-hidden="true">
          ${this.isSubsection ? hashtagIcon : paperDocumentIcon}
        </div>
        <div class="title-and-text ${showText ? 'has-text' : ''}">
          ${showText
            ? html`<span class="title">
                  ${renderAlgoliaSnippet(this.heading || this.title)}
                </span>
                <span class="text"> ${renderAlgoliaSnippet(this.text)} </span>`
            : html`<span class="title">
                ${renderAlgoliaSnippet(this.title)}
              </span>`}
        </div>
        ${this.isExternal
          ? html`
              <div class="icon-wrapper end" aria-hidden="true">
                ${openInNewIcon}
              </div>
            `
          : ''}
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
