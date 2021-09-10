/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, TemplateResult, nothing} from 'lit';
import {
  state,
  property,
  query,
  queryAll,
  customElement,
} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import Minisearch from 'minisearch';
import {addModsParameterToUrlIfNeeded} from '../mods.js';
import '@lion/combobox/define';
import {LionOption} from '@lion/listbox';
import type {Drawer} from '@material/mwc-drawer';

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

const SEARCH_ICON = html`<svg aria-hidden="true" viewbox="0 0 24 24">
  <path d="M0 0h24v24H0z" fill="none"></path>
  <path
    class="search-icon"
    fill="#6f6f6f"
    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
  ></path>
</svg>`;

/**
 * Search input component that can fuzzy search the site.
 */
@customElement('litdev-search')
class LitDevSearch extends LitElement {
  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;

      /* Subtle vertical layout placement. */
      margin-block-start: 4px;
    }

    .root {
      position: relative;
    }

    svg {
      position: absolute;
      inset-inline-end: 4px;
      inset-block-start: 0;
      /* If you press the search icon you will focus the input behind it. */
      pointer-events: none;
      height: 100%;
      aspect-ratio: 1/1;

      transition: opacity 1s;
    }

    lion-combobox > lion-options {
      /* Fix the dimensions of the suggestion dropdown */
      max-height: min(400px, 100vh - 60px);
      width: 400px;
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 10%);
    }

    lion-combobox {
      color: #6f6f6f;
      font-size: inherit;
      font-weight: inherit;
    }

    /* Mobile responsive search */
    @media (max-width: 864px) {
      lion-combobox {
        color: white;
      }

      lion-combobox input::placeholder {
        color: inherit;
      }

      svg .search-icon {
        fill: white;
      }

      lion-combobox > lion-options {
        /* Fix the dimensions of the suggestion dropdown */
        max-height: min(400px, 100vh - 60px);
        width: 240px;
        margin-inline-start: -20px;
      }
    }
  `;

  /**
   * Text value in search input.
   */
  @state()
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
  @queryAll('litdev-search-option')
  private searchOptionElements!: LitdevSearchOption[];

  /**
   * Search input within lion-combobox.
   */
  @query('lion-combobox input')
  private input!: HTMLInputElement;

  /**
   * Reference the search icon.
   */
  @query('svg')
  private searchIcon!: SVGElement;

  /**
   * Suggestions visible to the user rendered under the search input field.
   */
  @state()
  private suggestions: Suggestion[] = [];

  /**
   * Load and deserialize search index into `LitDevSearch.siteSearchIndex`.
   */
  private async loadSearchIndex() {
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
    LitDevSearch.siteSearchIndex = Minisearch.loadJSON<UserFacingPageData>(
      searchIndexJson,
      {
        idField: 'id',
        fields: ['title', 'heading', 'text'],
        storeFields: ['title', 'heading', 'relativeUrl', 'isSubsection'],
        searchOptions: {
          boost: {title: 1.4, heading: 1.2, text: 1},
          prefix: true,
          fuzzy: 0.2,
        },
      }
    );

    // If a search query has already been written, fill suggestions.
    this.querySearch(this.searchText);
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

    this.input.placeholder = 'Search';
  }

  /**
   * Repopulate suggestions with each input event.
   */
  private handleInput(e: InputEvent) {
    this.searchText = (e.target as HTMLInputElement).value ?? '';
    this.querySearch(this.searchText);
  }

  /**
   * Populate suggestion dropdown from query.
   *
   * An empty query clears suggestions.
   */
  private querySearch(query: string) {
    const trimmedQuery = query.trim();
    if (
      !LitDevSearch.siteSearchIndex ||
      trimmedQuery === '' ||
      trimmedQuery.length < 2
    ) {
      this.suggestions = [];
      return;
    }
    this.suggestions = (
      LitDevSearch.siteSearchIndex.search(trimmedQuery) ?? []
    ).slice(0, 10) as unknown as Suggestion[];
  }

  /**
   * Handle key press with side effects.
   *  - "Enter" finds the selected option and navigates to the page.
   */
  private handleKeyDown(e: KeyboardEvent) {
    if (this.searchOptionElements.length > 0 && e.key === 'Enter') {
      // Navigate to checked element.
      for (const el of this.searchOptionElements) {
        if (el.checked as boolean) {
          this.navigate(el.relativeUrl);
          return;
        }
      }
      // No element is selected. Fallback behavior is to navigate to the first
      // suggestion.
      const firstSuggestion = this.searchOptionElements[0];
      firstSuggestion.checked = true;
      this.navigate(firstSuggestion.relativeUrl);
    }
  }

  /**
   * Navigate to the provided url. Manually clears the input value as the
   * default behavior when navigating to a fragment on the page is not
   * refreshing the UI.
   */
  private navigate(url: string) {
    document.location = addModsParameterToUrlIfNeeded(url);
    this.input.value = '';
    this.searchText = '';

    // On mobile we manually close the nav drawer, otherwise the drawer remains
    // open when navigating between fragment identifiers.
    const navDrawer = document.querySelector(
      'mwc-drawer#mobileDrawer'
    ) as Drawer;
    if (navDrawer) {
      navDrawer.open = false;
    }
  }

  /**
   * We hide the search icon on focus to prevent text overlapping the icon.
   */
  private onFocus() {
    this.searchIcon.style.setProperty('opacity', '0');
  }

  private onBlur() {
    this.searchIcon.style.setProperty('opacity', '1');
  }

  render() {
    return html`
      <div class="root">
        <lion-combobox
          name="lit-search"
          autocomplete="none"
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
          @focus=${this.onFocus}
          @blur=${this.onBlur}
        >
          ${repeat(
            this.suggestions,
            (v) => v.id,
            ({
              relativeUrl,
              title,
              heading,
              isSubsection,
            }) => html` <!-- Set choiceValue to the current searchInput to override autofill behavior. -->
              <litdev-search-option
                .choiceValue="${this.searchText}"
                .relativeUrl="${relativeUrl}"
                .title="${title}"
                .heading="${heading}"
                .isSubsection="${isSubsection}"
                @click="${() => this.navigate(relativeUrl)}"
              ></litdev-search-option>`
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
@customElement('litdev-search-option')
class LitdevSearchOption extends LionOption {
  @property()
  relativeUrl = '';

  @property()
  title = '';

  @property()
  heading = '';

  @property({type: Boolean})
  isSubsection = false;

  static styles = [
    ...super.styles,
    css`
      .suggestion {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        padding: 0.2em 2em;
        border-block-end: 1px solid #ddd;
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

      .title,
      .header {
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

      @media (max-width: 864px) {
        .suggestion {
          padding: 0.2em 0.4em;
        }
      }
    `,
  ];

  render() {
    return html`
      <div class="suggestion">
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
    'litdev-search-option': LitdevSearchOption;
  }
}
