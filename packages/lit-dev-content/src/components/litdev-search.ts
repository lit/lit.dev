/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, TemplateResult, nothing} from 'lit';
import {state, property, queryAll, customElement} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import Minisearch from 'minisearch';

import '@lion/combobox/define';
import {LionOption} from '@lion/listbox';

/**
 * Representation of each document indexed by Minisearch.
 *
 * Duplicated interface that must match `/lit-dev-tools/src/search/plugin.ts`
 */
interface UserFacingPageData {
  id: string;
  relativeUrl: string;
  title: string;
  heading: string;
  text: string;
  isSubsection: boolean;
}

/**
 * Suggestion returned by Minisearch when there is a matching search result.
 */
type Suggestion = Omit<UserFacingPageData, 'text'>;

/**
 * Returns a page suggestion TemplateResult with title and optional heading.
 */
function titleAndHeadingCard(
  title: string,
  heading: string,
  isSubsection: boolean
): TemplateResult {
  if (isSubsection) {
    return html`<div class="title-and-header">
      <span class="title">${title}</span><span class="header">${heading}</span>
    </div>`;
  }
  return html`<span class="header">${title}</span>`;
}

/**
 * Used to mark a search page suggestion with the API chip.
 */
function isApiLink(url: string) {
  return url.includes('docs/api/');
}

const SEARCH_ICON = html`<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" aria-hidden="true">
  <path d="M0 0h24v24H0z" fill="none"></path>
  <path class="search-icon" fill="#6f6f6f" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
</svg>`

/**
 * Search input component that can fuzzy search the site.
 */
@customElement('litdev-search')
class LitDevSearch extends LitElement {
  static styles = css`
    :host {
      /* Required to vertically center the search text. */
      padding-top: 4px;
      margin-left: 0.5em;
      width: 222px;
    }

    #padding-container {
      margin: 0.3em 0.5em;
      padding: 0.2em;
      border-radius: 4px;
      display: flex;
    }

    svg {
      margin-left: 0.3em;
    }

    lion-combobox > lion-options {
      /* Fix the dimensions of the suggestion dropdown */
      max-height: min(400px, 100vh - 60px);
      width: 400px;
    }

    lion-combobox {
      color: #6f6f6f;
      font-size: 0.9em;
      font-weight: 600;
    }

    /* Mobile responsive search */
    @media (max-width: 864px) {
      lion-combobox {
        color: white;
      }

      svg .search-icon {
        fill: white;
      }

      #padding-container {
        margin: unset;
        padding: unset;
      }

      lion-combobox > lion-options {
        /* Fix the dimensions of the suggestion dropdown */
        max-height: min(400px, 100vh - 60px);
        width: 255px;
        margin-left: -8px;
      }
    }
  `;

  /**
   * Text value in search input.
   */
  private searchText: string = '';

  /**
   * Site search index.
   */
  private static siteSearchIndex: Minisearch<UserFacingPageData> | null = null;

  /**
   * Flag so we only load the index once.
   */
  private static loadingSearchIndex: boolean = false;

  /**
   * Search suggestion options.
   */
  @queryAll('search-option')
  private searchOptionElements!: SearchOption[];

  /**
   * Suggestions visible to the user rendered under the search input field.
   */
  @state()
  private suggestions: Suggestion[] = [];

  /**
   * Load and deserialize search index into `LitDevSearch.siteSearchIndex`.
   */
  async loadSearchIndex () {
    // We already have a search index.
    if (LitDevSearch.siteSearchIndex !== null) {
      return;
    }
    if (LitDevSearch.loadingSearchIndex) {
      return;
    }
    LitDevSearch.loadingSearchIndex = true;

    const searchIndexJson = await (await fetch('/searchIndex.json')).text();
  
    // Minisearch intialization config must exactly match
    // `/lit-dev-tools/src/search/plugin.ts` Minisearch options.
    LitDevSearch.siteSearchIndex = Minisearch.loadJSON<UserFacingPageData>(searchIndexJson, {
      idField: 'id',
      fields: ['title', 'heading', 'text'],
      storeFields: ['title', 'heading', 'relativeUrl', 'isSubsection'],
      searchOptions: {
        boost: {title: 1.4, heading: 1.2, text: 1},
        prefix: true,
        fuzzy: 0.2,
      },
    });

    // If a search query has already been written, fill suggestions.
    this.querySearch(this.searchText)
  }

  /**
   * Load the search index.
   */
  firstUpdated() {
    // Late load search index when page is idle.
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => this.loadSearchIndex());
    } else {
      setTimeout(() => this.loadSearchIndex(), 500);
    }
  }

  /**
   * Repopulate suggestions with each input event.
   */
  handleInput(e: InputEvent) {
    this.searchText = (e.target as HTMLInputElement).value ?? '';
    this.querySearch(this.searchText);
  }

  /**
   * Populate suggestion dropdown from query.
   *
   * An empty query clears suggestions.
   */
  querySearch(query: string) {
    if (!LitDevSearch.siteSearchIndex || query === '' || query.length < 2) {
      this.suggestions = [];
      return;
    }
    this.suggestions = (LitDevSearch.siteSearchIndex.search(query) ?? []).slice(
      0,
      10
    ) as unknown as Suggestion[];
  }

  /**
   * Handle key press with side effects.
   *  - "Enter" finds the selected option and navigates to the page.
   */
  handleKeyDown (e: KeyboardEvent) {
    if (this.searchOptionElements.length > 0 && e.key === 'Enter') {
      // Navigate to checked element.
      for (const el of this.searchOptionElements) {
        if (el.checked as boolean) {
          document.location = el.relativeUrl as unknown as Location;
          return;
        }
      }
      // No element is selected. Fallback behavior is to navigate to the first
      // suggestion.
      const firstSuggestion = this.searchOptionElements[0];
      firstSuggestion.checked = true;
      document.location = firstSuggestion.relativeUrl as unknown as Location;
    }
  }

  render() {
    return html`
      <div id="padding-container">
        <lion-combobox
          name="lit-search"
          autocomplete="none"

          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        >
          ${repeat(
            this.suggestions,
            (v) => v.id,
            ({relativeUrl, title, heading, isSubsection}) => html`
              <!-- Set choiceValue to the current searchInput to override autofill behavior. -->
              <search-option
                .choiceValue="${this.searchText}"
                .relativeUrl="${relativeUrl}"
                .title="${title}"
                .heading="${heading}"
                .isSubsection="${isSubsection}"
              >`
          )}
        </lion-combobox>
        ${SEARCH_ICON}
      </div>
    `;
  }
}

/**
 * A single search option suggestion.
 */
@customElement('search-option')
class SearchOption extends LionOption {
  @property({type: String})
  relativeUrl = '';

  @property({type: String})
  title = '';

  @property({type: String})
  heading = '';

  @property({type: Boolean})
  isSubsection = false;

  static get styles() {
    return [
      ...super.styles,
      css`
        .suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 50px;
          padding: 0.2em 2em;
          border-bottom: 1px solid #ddd;
          background-color: white;
          color: black;
          font-size: 16px;
          cursor: pointer;
        }

        .title-and-header {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .title, .header {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .header {
          font-size: 0.9em;
          font-weight: 600;
        }

        .api-tag {
          color: white;
          background-color: #6e6e6e;
          padding: 0 0.5em;
          margin-left: 1em;
          font-weight: 600;
        }
      `,
    ];
  }

  /**
   * Handle navigation when clicking a suggestion directly.
   */
  private navigate = () => {
    document.location = this.relativeUrl as unknown as Location;
  }

  render() {
    return html`
      <div class="suggestion" @click=${this.navigate}>
        ${titleAndHeadingCard(this.title, this.heading, this.isSubsection)}
        ${isApiLink(this.relativeUrl)
          ? html`<span class="api-tag">API</span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-search': LitDevSearch;
    'search-option': SearchOption;
  }
}
