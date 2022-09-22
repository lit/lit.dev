/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {backArrowIcon} from '../icons/back-arrow-icon.js';
import {forwardArrowIcon} from '../icons/forward-arrow-icon.js';
import {AgloliaSearchController} from './algolia-search-controller.js';
import type {Suggestion} from './litdev-search.js';

@customElement('litdev-search-screen')
export class LitDevSearch extends LitElement {
  private _searchController = new AgloliaSearchController<Suggestion>(
    this,
    () => this._query,
    {
      attributesToRetrieve: ['*', '-text', '-heading'],
      attributesToSnippet: ['text:50'],
      attributesToHighlight: ['heading', 'title'],
      page: () => this._page,
    }
  );
  @state() private _query;
  @state() private _page;

  constructor() {
    super();
    const params = new URLSearchParams(location.search);
    this._query = params.get('q') ?? '';
    this._page = Number(params.get('page') ?? '0');
  }

  render() {
    const numberPages = this._searchController.resultMeta?.nbPages;
    const isNextButtonHidden = !numberPages || this._page + 1 >= numberPages;
    return html`
      <section>
        <h1>Search results for "${this._query}":</h1>
        <nav aria-live="assertive">
          ${repeat(
            this._searchController.value,
            (hit) => hit.id,
            (hit) => html`
              <a href=${hit.relativeUrl}>
                <h2>${unsafeHTML(hit._highlightResult.title.value)}</h2>
                <h3>${unsafeHTML(hit._highlightResult.heading.value)}</h3>
                <p>${unsafeHTML(hit._snippetResult.text.value)}</p>
              </a>
            `
          )}
        </nav>
        <div class="pagination">
          <button
            ?invisible=${this._page === 0}
            @click=${this._onPreviousClick}
          >
            ${backArrowIcon}
            <span>Page ${this._page - 1}</span>
          </button>
          <button ?invisible=${isNextButtonHidden} @click=${this._onNextClick}>
            <span>Page ${this._page + 1}</span>
            ${forwardArrowIcon}
          </button>
        </div>
      </section>
    `;
  }

  private _onPreviousClick() {
    this._page--;
    this._scrollTop();
  }

  private _onNextClick() {
    this._page++;
    this._scrollTop();
  }

  private _scrollTop() {
    window.scroll({
      top: 0,
    });
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      --__padding-block: 16px;
      --__padding-inline: 24px;
      --__hover-border-width: 2px;
      --__border-width: 1px;
    }

    [invisible] {
      visibility: hidden;
    }

    section {
      min-width: 850px;
      width: 80%;
      box-sizing: border-box;
    }

    h2 {
      margin-block-start: 0;
      margin-block-end: 1rem;
    }

    h3 {
      margin-block: 0.75rem;
    }

    a {
      display: block;
      text-decoration: none;
      color: rgb(62, 62, 62);
      cursor: pointer;
      border: var(--__border-width) solid var(--color-medium-gray);
      margin-block: 16px;
      padding: var(--__padding-block) var(--__padding-inline);
    }

    a:hover,
    a:focus {
      border-color: var(--color-blue);
      border-width: var(--__hover-border-width);

      --__border-width-difference: calc(
        var(--__hover-border-width) - var(--__border-width)
      );

      padding: calc(var(--__padding-block) - var(--__border-width-difference))
        calc(var(--__padding-inline) - var(--__border-width-difference));
    }

    em {
      font-style: normal;
      text-decoration: underline;
      color: var(--color-blue);
    }

    p {
      margin-block-end: 0;
      font-size: 0.875em;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
    }

    .pagination button {
      --__padding-block: 8px;
      --__padding-inline: 16px;
      --__hover-border-width: 2px;
      --__border-width: 1px;
      border: var(--__border-width) solid var(--color-medium-gray);
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      background-color: transparent;
      padding: var(--__padding-block) var(--__padding-inline);
      font-size: 1rem;
      cursor: pointer;
    }

    .pagination button:hover,
    .pagination button:focus {
      border-color: var(--color-blue);
      color: var(--color-blue);
      border-width: var(--__hover-border-width);
      --__border-width-difference: calc(
        var(--__hover-border-width) - var(--__border-width)
      );
      padding: calc(var(--__padding-block) - var(--__border-width-difference))
        calc(var(--__padding-inline) - var(--__border-width-difference));
    }

    .pagination button:first-child svg {
      margin-inline-end: 8px;
    }

    .pagination button:last-child svg {
      margin-inline-start: 8px;
    }

    @media (max-width: 864px) {
      section {
        width: 100%;
        min-width: unset;
      }
    }
  `;
}
