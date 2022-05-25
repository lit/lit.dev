/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  LitElement,
  html,
  css,
  TemplateResult,
  nothing,
  PropertyValues,
} from 'lit';
import {
  state,
  property,
  queryAll,
  customElement,
  query,
} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {styleMap} from 'lit/directives/style-map.js';
import Minisearch from 'minisearch';
import type {Drawer} from '@material/mwc-drawer';
import {animate, Options as AnimationOptions} from '@lit-labs/motion';

/**
 * Representation of each document indexed by Minisearch.
 *
 * Duplicated interface that must match `/lit-dev-tools-cjs/src/search/plugin.ts`
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

const SEARCH_ICON = (opacity: '0' | '1') => html`<svg
  style="opacity: ${opacity}"
  aria-hidden="true"
  viewbox="0 0 24 24"
>
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
export class LitDevSearch extends LitElement {
  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;

      /* Subtle vertical layout placement. */
      margin-block-start: 4px;
    }

    #popup {
      position: absolute;
    }

    #root {
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

    #items {
      display: block;
      overflow: auto;
      z-index: 1;
      background: rgb(255, 255, 255);
      /* Fix the dimensions of the suggestion dropdown */
      max-height: min(400px, 100vh - 60px);
      width: 400px;
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 10%);
      padding: 0;
      margin: 0;
    }

    input {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: transparent;
      color: currentColor;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      border: none;
      border-block-end: solid currentColor;
      border-block-end-width: 1px;
      outline: none;
    }

    input:focus {
      border-block-end-width: 2px;
    }

    input::placeholder {
      color: currentColor;
    }

    /* Mobile responsive search */
    @media (max-width: 864px) {
      svg .search-icon {
        fill: white;
      }

      #items {
        /* Fix the dimensions of the suggestion dropdown */
        max-height: min(400px, 100vh - 60px);
        width: 240px;
      }
    }
  `;

  /**
   * Text value in search input.
   */
  @state()
  private _searchText: string = '';

  /**
   * Site search index.
   */
  private static _siteSearchIndex: Minisearch<UserFacingPageData> | null = null;

  /**
   * Flag so we only load the index once.
   */
  private static _loadingSearchIndex: boolean = false;

  /**
   * Search suggestion options.
   */
  @queryAll('litdev-search-option')
  private _searchOptionElements!: LitdevSearchOption[];

  @query('#popup')
  private _popupEl!: HTMLElement;

  @query('input')
  private _inputEl!: HTMLInputElement;

  /**
   * Suggestions visible to the user rendered under the search input field.
   */
  @state()
  private _suggestions: Suggestion[] = [];

  /**
   * Whether the input is focused or not.
   */
  @state()
  private _isFocused = false;

  /**
   * Currently selected suggestion.
   */
  @state()
  private _selectedIndex = -1;

  /**
   * Whether the listbox should be visible or not. Used for async animations.
   */
  @state()
  private _isListboxVisible = false;

  /**
   * Whether the listbox should be popped up with `right: 0` or not.
   *
   * This is when the listbox would pop up and overflow off the right of the
   * screen.
   */
  @state()
  private _popupSpaceRight = false;

  /**
   * Whether the listbox should be popped up with `left: 0` or not.
   *
   * This is when the listbox would pop up and overflow off the left of the
   * screen.
   */
  @state()
  private _popupSpaceLeft = false;

  render() {
    const isExpanded = this._isFocused && this._suggestions.length > 0;
    const activeDescendant =
      this._selectedIndex !== -1 ? `${this._selectedIndex}` : nothing;

    const listboxStyles = styleMap({
      // isListboxVisible allows animation fade away
      visibility: isExpanded || this._isListboxVisible ? 'visible' : 'hidden',
      opacity: isExpanded ? '1' : '0',
      right: this._popupSpaceRight ? '0px' : 'auto',
      left: this._popupSpaceLeft ? '0px' : 'auto',
    });
    const listboxAnimationOptions: AnimationOptions = {
      properties: ['opacity'],
      onComplete: () => {
        this._isListboxVisible = isExpanded;
      },
    };
    return html`
      <div
        id="root"
        .suggestions=${this._suggestions}
        @focus=${this._onFocus}
        @blur=${this._onBlur}
      >
        <input
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          role="combobox"
          placeholder="Search"
          aria-label="Lit Site Search"
          aria-haspopup="listbox"
          aria-owns="items"
          aria-expanded=${isExpanded ? 'true' : 'false'}
          aria-autocomplete="list"
          aria-activedescendant=${activeDescendant}
          @input=${this._onInput}
          @keydown=${this._onKeydown}
        />
        <div
          id="popup"
          ${animate(listboxAnimationOptions)}
          style=${listboxStyles}
        >
          <ul id="items" role="listbox">
            ${repeat(
              this._suggestions,
              (v) => v.id,
              (
                {relativeUrl, title, heading, isSubsection},
                index
              ) => html`<litdev-search-option
                id=${index}
                ?checked=${this._selectedIndex === index}
                .relativeUrl="${relativeUrl}"
                .title="${title}"
                .heading="${heading}"
                .isSubsection="${isSubsection}"
                role="option"
                @click="${() => this._navigate(relativeUrl)}"
              ></litdev-search-option>`
            )}
          </ul>
        </div>
        ${SEARCH_ICON(this._isFocused ? '0' : '1')}
      </div>
    `;
  }

  /**
   * Load and deserialize search index into `LitDevSearch.siteSearchIndex`.
   */
  private async _loadSearchIndex() {
    // We already have a search index.
    if (LitDevSearch._siteSearchIndex !== null) {
      return;
    }
    if (LitDevSearch._loadingSearchIndex) {
      return;
    }
    LitDevSearch._loadingSearchIndex = true;

    const searchIndexJson = await (await fetch('/searchIndex.json')).text();

    // Minisearch intialization config must exactly match
    // `/lit-dev-tools-cjs/src/search/plugin.ts` Minisearch options.
    LitDevSearch._siteSearchIndex = Minisearch.loadJSON<UserFacingPageData>(
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
    this._querySearch(this._searchText);
  }

  /**
   * Load the search index.
   */
  firstUpdated() {
    this._loadSearchIndex();
    // required for popping up on hydration
    this._isFocused = !!this.shadowRoot?.activeElement;
  }

  updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('_isFocused') || changed.has('_suggestions')) {
      const isExpanded = this._isFocused && this._suggestions.length > 0;
      if (!isExpanded) {
        return;
      }

      this._positionPopup();
    }
  }

  /**
   * Repopulate suggestions with each input event.
   */
  private _onInput(e: InputEvent) {
    this._searchText = (e.target as HTMLInputElement).value ?? '';
    this._querySearch(this._searchText);
  }

  /**
   * Populate suggestion dropdown from query.
   *
   * An empty query clears suggestions.
   */
  private _querySearch(query: string) {
    const trimmedQuery = query.trim();
    this._selectedIndex = -1;
    if (
      !LitDevSearch._siteSearchIndex ||
      trimmedQuery === '' ||
      trimmedQuery.length < 2
    ) {
      this._suggestions = [];
      return;
    }
    this._suggestions = (
      LitDevSearch._siteSearchIndex.search(trimmedQuery) ?? []
    ).slice(0, 10) as unknown as Suggestion[];
    this._selectedIndex = -1;
  }

  /**
   * Handle key press with side effects.
   *  - "Enter" finds the selected option and navigates to the page.
   */
  private _onKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        this._selectNext();
        break;
      case 'ArrowUp':
        this._selectPrevious();
        break;
      case 'Enter':
        this._select();
        break;
    }
  }

  /**
   * Selects the next item on the list or wraps around if at end.
   */
  private _selectNext() {
    const opts = this._searchOptionElements;
    const numItems = opts.length;
    this._selectedIndex++;
    if (this._selectedIndex >= numItems) {
      this._selectedIndex = 0;
    }
  }

  /**
   * Selects the previous item on the list or wraps around if at start.
   */
  private _selectPrevious() {
    const opts = this._searchOptionElements;
    const numItems = opts.length;
    this._selectedIndex--;
    if (this._selectedIndex < 0) {
      this._selectedIndex = numItems - 1;
    }
  }

  /**
   * Handles the enter keypress and navigates accordingly.
   */
  private _select() {
    const opts = this._searchOptionElements;
    if (opts.length === 0) {
      return;
    }

    // Navigate to checked element.
    for (const el of opts) {
      if (el.checked as boolean) {
        this._navigate(el.relativeUrl);
        return;
      }
    }
    // No element is selected. Fallback behavior is to navigate to the first
    // suggestion.
    const firstSuggestion = opts[0];
    firstSuggestion.checked = true;
    this._navigate(firstSuggestion.relativeUrl);
  }

  /**
   * Navigate to the provided url. Manually clears the input value as the
   * default behavior when navigating to a fragment on the page is not
   * refreshing the UI.
   */
  private async _navigate(url: string) {
    const {addModsParameterToUrlIfNeeded} = await import('../mods.js');
    document.location = addModsParameterToUrlIfNeeded(url);
    this._searchText = '';

    // On mobile we manually close the nav drawer, otherwise the drawer remains
    // open when navigating between fragment identifiers.
    const navDrawer = document.querySelector(
      'mwc-drawer#mobileDrawer'
    ) as Drawer;
    if (navDrawer) {
      navDrawer.open = false;
    }
  }

  focus() {
    this._inputEl.focus();
  }

  /**
   * Hides the search icon on focus to prevent text overlapping the icon, and
   * expands the listbox.
   */
  private _onFocus() {
    this._isFocused = true;
  }

  /**
   * Shows the search icon on blur, and collapses the listbox.
   */
  private _onBlur() {
    this._isFocused = false;
  }

  /**
   * Positions the popup left or right justified with respect to the input
   * depending on whether the listbox is overflowing the window.
   */
  private _positionPopup() {
    const popup = this._popupEl;
    const windowWidth = window.innerWidth;
    const popupRight = popup.getBoundingClientRect().right;

    if (popupRight > windowWidth) {
      this._popupSpaceRight = true;
      this._popupSpaceLeft = false;
      return;
    }

    const popupLeft = popup.getBoundingClientRect().left;

    if (popupLeft <= 0) {
      this._popupSpaceRight = false;
      this._popupSpaceLeft = true;
      return;
    }
  }
}

/**
 * A single search option suggestion.
 */
@customElement('litdev-search-option')
class LitdevSearchOption extends LitElement {
  @property()
  relativeUrl = '';

  @property()
  title = '';

  @property()
  heading = '';

  @property({type: Boolean})
  isSubsection = false;

  @property({type: Boolean})
  checked = false;

  static get styles() {
    return [
      css`
        :host {
          display: block;
          padding: 4px;
        }

        :host([checked]) {
          background-color: rgb(189, 228, 255);
        }

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
  }

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

  updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('checked') && this.checked) {
      this.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-search': LitDevSearch;
    'litdev-search-option': LitdevSearchOption;
  }
}
