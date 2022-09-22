/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, nothing} from 'lit';
import {state, customElement, query} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {live} from 'lit/directives/live.js';
import type {Drawer} from '@material/mwc-drawer';
import {AgloliaSearchController} from './algolia-search-controller.js';
import {classMap} from 'lit/directives/class-map.js';
import {searchIcon} from '../icons/search-icon.js';
import './litdev-search-option.js';
import type {LitdevSearchOption} from './litdev-search-option.js';

/**
 * Representation of each document indexed by our PageChunker which is published
 * to Algolia.
 *
 * Duplicated interface that must match `/lit-dev-tools-cjs/src/search/plugin.ts`
 */
export interface UserFacingPageData {
  id: number;
  relativeUrl: string;
  title: string;
  heading: string;
  text: string;
  isSubsection: boolean;
}

/**
 * Algolia result that returns stringified HTML that is highlighted.
 */
export type HighlightOrSnippetResult<T> = {
  [key in keyof T]: {
    value: string;
  };
};

/**
 * Subset of the suggestion returned by Algolia when there is a matching search
 * result.
 */
export type Suggestion = Omit<UserFacingPageData, 'text' | 'heading'> & {
  _highlightResult: Pick<
    HighlightOrSnippetResult<UserFacingPageData>,
    'title' | 'heading'
  >;
  _snippetResult: Pick<HighlightOrSnippetResult<UserFacingPageData>, 'text'>;
};

/**
 * Metadata for the type of search suggestion chip to display.
 */
interface SuggestionType {
  tag: string;
  type: string;
}

/**
 * Search suggestions grouped by title and content type.
 */
interface SuggestionGroup {
  suggestions: Suggestion[];
  type: string;
  tag: string;
}

/**
 * A collection of SuggestionGroups in which the key is determined by the
 * suggestion title and the type of content.
 *
 * e.g. LifecycleDocs or ReactiveElementAPI
 */
interface SuggestionGroups {
  [group: string]: SuggestionGroup;
}

/**
 * Used to mark a search page suggestion with the API chip.
 */
function isApiLink(url: string) {
  return url.startsWith('/docs/api/');
}

/**
 * Used to mark a search page suggestion with the DOC chip.
 */
function isDocsLink(url: string) {
  return url.startsWith('/docs/') && !isApiLink(url);
}

/**
 * Used to mark a search page suggestion with the ARTICLE chip.
 */
function isArticleLink(url: string) {
  return url.startsWith('/articles/');
}

/**
 * Determines the type of search suggestion chip to display.
 *
 * @param url The relative URL of the page.
 * @returns An object that determines the type of content, and the class used
 *     for determining the relevant tag color.
 */
const getSuggestionType = (url: string): SuggestionType => {
  let suggestionType: SuggestionType = {
    tag: 'other',
    type: 'Other',
  };
  if (isApiLink(url)) {
    suggestionType = {
      tag: 'api',
      type: 'API',
    };
  } else if (isDocsLink(url)) {
    suggestionType = {
      tag: 'docs',
      type: 'Docs',
    };
  } else if (isArticleLink(url)) {
    suggestionType = {
      tag: 'article',
      type: 'Article',
    };
  }

  return suggestionType;
};

/**
 * Search input component that can fuzzy search the site.
 *
 * @fires close - Fired when the escape key or cancel button is pressed.
 */
@customElement('litdev-search')
export class LitDevSearch extends LitElement {
  /**
   * Text value in search input.
   */
  @state()
  private _searchText: string = '';

  @query('input')
  private _inputEl!: HTMLInputElement;

  @query('[checked]')
  private _checkedEl!: LitdevSearchOption | null;

  /**
   * Currently selected suggestion.
   */
  @state()
  private _selectedIndex = -1;

  private _searchController = new AgloliaSearchController<Suggestion>(
    this,
    () => this._searchText,
    {
      // Algolia _highlightResult adds a lot to response size
      attributesToHighlight: ['heading', 'title'],
      // We don't need to return the full text of result so don't request it
      attributesToRetrieve: ['*', '-text', '-heading'],
      attributesToSnippet: ['text'],
    }
  );

  render() {
    const activeDescendant =
      this._selectedIndex !== -1 ? `${this._selectedIndex}` : nothing;

    const items = this._searchController.value;

    return html`
      <div id="root">
        <input
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          role="combobox"
          placeholder="Search"
          aria-label="Lit Site Search"
          aria-haspopup="listbox"
          aria-owns="items"
          aria-expanded=${items.length ? 'true' : 'false'}
          aria-autocomplete="list"
          aria-activedescendant=${activeDescendant}
          .value=${live(this._searchText)}
          @input=${this._onInput}
          @keydown=${this._onKeydown}
        />
        ${searchIcon}
        <button @click=${() => this.dispatchEvent(new Event('close'))}>
          Cancel
        </button>
      </div>
      <ul id="items" role="listbox" class=${classMap({expanded: items.length})}>
        ${this._renderGroups()}
      </ul>
    `;
  }

  /**
   * Renders the search combobox suggestions grouped by title and content type.
   */
  private _renderGroups() {
    const groupedSuggestions = this._groupSuggestions();
    const groups = Object.keys(groupedSuggestions);

    // for aria-activedescendant we need each item in each group to have a
    // unique id. So we keep a running counter across all groups.
    let suggestionIndex = -1;

    return repeat(
      groups,
      (group) => group,
      (group) => {
        return html`<section class="group">
          ${this._renderGroupTitle(groupedSuggestions[group])}
          ${repeat(
            groupedSuggestions[group].suggestions,
            ({id}) => id,
            ({relativeUrl, _highlightResult, _snippetResult, isSubsection}) => {
              const title = _highlightResult.title.value;
              const heading = _highlightResult.heading.value;
              const text = _snippetResult.text.value;
              // Increment the current index.
              suggestionIndex++;
              return html`
                <litdev-search-option
                  id=${suggestionIndex}
                  ?checked=${this._selectedIndex === suggestionIndex}
                  .relativeUrl="${relativeUrl}"
                  .title="${title}"
                  .heading="${heading}"
                  .text="${text}"
                  .isSubsection="${isSubsection}"
                  role="option"
                  @pointerenter=${this._onSuggestionHover(suggestionIndex)}
                  @click="${() => this._navigate(relativeUrl)}"
                ></litdev-search-option>
              `;
            }
          )}
        </section>`;
      }
    );
  }

  /**
   * Renders the title and the content type chip of a search suggestion group.
   */
  private _renderGroupTitle(group: SuggestionGroup) {
    return html`<div class="descriptor">
      <span class="title"> ${group.suggestions[0].title} </span>
      <span class="tag-wrapper">
        <span class="tag ${group.tag}"> ${group.type} </span>
      </span>
    </div>`;
  }

  /**
   * Groups the current search suggestions together by document.
   *
   * @returns A collection of SuggestionGroups grouped by title and content type
   *    (essentially by document).
   */
  private _groupSuggestions() {
    const suggestions = this._searchController.value;
    const groupedSuggestions: SuggestionGroups = {};

    for (const suggestion of suggestions) {
      const suggestionType = getSuggestionType(suggestion.relativeUrl);
      // Group suggestions by title and content type. This should be unique
      // enough until we are able to group by URL at the index level.
      const group = `${suggestion.title}${suggestionType.tag}`;

      // If the group doesn't exist, create it.
      groupedSuggestions[group] = groupedSuggestions[group] || {
        suggestions: [],
        ...suggestionType,
      };

      if (!suggestion.isSubsection) {
        // If it's the title link, prepend it so it shows up first.
        groupedSuggestions[group].suggestions.unshift(suggestion);
      } else {
        groupedSuggestions[group].suggestions.push(suggestion);
      }
    }

    return groupedSuggestions;
  }

  /**
   * @param index Index of the suggestion to select.
   * @returns A hover event listener that selects the suggestion at the given
   *    index.
   */
  private _onSuggestionHover(index: number) {
    return () => (this._selectedIndex = index);
  }

  /**
   * Repopulate suggestions with each input event.
   */
  private _onInput(e: InputEvent) {
    this._searchText = (e.target as HTMLInputElement).value ?? '';
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
      case 'Escape':
        const oldText = this._searchText;
        this._selectedIndex = -1;
        this._inputEl.blur();
        this.dispatchEvent(new Event('close'));
        // prevent the input from closing drawer if there was text
        if (oldText.trim()) {
          e.stopPropagation();
        }
        break;
      default:
        break;
    }
  }

  /**
   * Selects the next item on the list or wraps around if at end.
   */
  private _selectNext() {
    const numItems = this._searchController.value.length;
    this._selectedIndex++;
    if (this._selectedIndex >= numItems) {
      this._selectedIndex = 0;
    }
  }

  /**
   * Selects the previous item on the list or wraps around if at start.
   */
  private _selectPrevious() {
    const numItems = this._searchController.value.length;
    this._selectedIndex--;
    if (this._selectedIndex < 0) {
      this._selectedIndex = numItems - 1;
    }
  }

  /**
   * Handles the enter keypress and navigates accordingly.
   */
  private _select() {
    const numItems = this._searchController.value.length;
    if (numItems === 0) {
      return;
    }

    const checkedEl = this._checkedEl;

    // Navigate to checked element.
    if (checkedEl) {
      this._navigate(checkedEl.relativeUrl);
      return;
    }

    // No element is selected. Fallback behavior is to navigate to the first
    // suggestion.
    this._selectedIndex = 0;
    this._navigate(`/search/?q=${this._searchText}`);
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

    this.dispatchEvent(new Event('close'));
  }

  focus() {
    this._inputEl.focus();
  }

  static styles = css`
    :host {
      --_cancel-button-width: 70px;
      --_input-height: 50px;
      --_input-padding: 12px;
      --_input-border-width: 1px;
      --_input-border-width-focus: 2px;
      --_items-margin-block-start: 16px;
      box-sizing: border-box;
      font-weight: 400;
    }

    #root {
      position: relative;
      display: flex;
      height: var(--_input-height);
    }

    #root button {
      display: none;
    }

    svg {
      position: absolute;
      inset-inline-end: var(--_input-padding);
      inset-block-start: 0;
      /* If you press the search icon you will focus the input behind it. */
      pointer-events: none;
      height: 100%;
      aspect-ratio: 1/1;

      transition: opacity 1s;
      color: var(--color-blue);
    }

    input:focus ~ svg {
      opacity: 0;
    }

    #items {
      display: block;
      z-index: 1;
      padding: 0;
      max-height: 488px;
      overflow: auto;
      margin-inline: calc(-1 * var(--search-modal-padding));
      margin-block-start: var(--_items-margin-block-start);
      margin-block-end: calc(-1 * var(--search-modal-padding));
      padding-block-end: var(--search-modal-padding);
      padding-inline: var(--search-modal-padding);
      scrollbar-color: auto var(--color-light-gray);
      scrollbar-width: thin;
    }

    #items::-webkit-scrollbar {
      width: 12px;
    }

    #items::-webkit-scrollbar-thumb {
      background-color: rgba(60, 60, 60, 0.7);
      border-radius: 6px;
      border: 3px solid var(--color-light-gray);
    }

    #items::-webkit-scrollbar-track {
      background-color: transparent;
    }

    #items:not(.expanded) {
      margin-block: 0;
      padding-block-end: 0;
    }

    input {
      width: 100%;
      height: 100%;
      margin: calc(
        var(--_input-border-width-focus) - var(--_input-border-width)
      );
      padding: var(--_input-padding);
      box-sizing: border-box;
      background-color: transparent;
      color: currentColor;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      border: solid var(--_input-border-width) var(--color-blue);
      outline: none;
    }

    input:focus {
      border-width: var(--_input-border-width-focus);
      margin: 0;
    }

    input::placeholder {
      color: currentColor;
    }

    .group {
      margin-block-start: 12px;
    }

    .group .descriptor {
      color: var(--color-blue);
      font-size: 0.9rem;

      display: flex;
      justify-content: space-between;
    }

    .group .tag-wrapper {
      display: flex;
      align-items: flex-end;
    }

    .group .tag {
      color: white;
      background-color: #6e6e6e;
      padding: 0 0.5em;
      font-weight: 600;
    }

    .group .tag.article {
      background-color: #f9a012;
    }

    .group .tag.docs {
      color: white;
      background-color: #324fff;
    }

    @media (max-width: 864px) {
      #root button {
        display: block;
        background-color: transparent;
        border: none;
        color: var(--color-blue);
        cursor: pointer;
        font-size: 18px;
        min-width: var(--_cancel-button-width);
        width: var(--_cancel-button-width);
        padding: 0;
      }

      svg {
        inset-inline-end: calc(
          var(--_input-padding) + var(--_cancel-button-width)
        );
      }

      #items {
        max-height: calc(
          100vh - var(--_input-height) - 2 * var(--search-modal-padding) -
            var(--_items-margin-block-start)
        );
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'litdev-search': LitDevSearch;
  }
}
