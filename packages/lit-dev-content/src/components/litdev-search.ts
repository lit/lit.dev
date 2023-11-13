/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css, nothing} from 'lit';
import {state, customElement, query, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {live} from 'lit/directives/live.js';
import {AgloliaSearchController} from './algolia-search-controller.js';
import {classMap} from 'lit/directives/class-map.js';
import type {Drawer} from '@material/mwc-drawer';
import type {LitdevSearchOption} from './litdev-search-option.js';

import './litdev-search-option.js';
import './lazy-svg.js';

/**
 * Generic that denotes the type of document.
 */
interface DocType<U extends string> {
  type: string;
  tag: U;
}

/**
 * The types of documents we index. Used to generate the search tags on the
 * frontend and used to re-rank results on the frontend.
 */
type DocTypes =
  | DocType<'article'>
  | DocType<'tutorial'>
  | DocType<'docs'>
  | DocType<'api'>
  | DocType<'video'>
  | DocType<'other'>;

/**
 * Representation of each record indexed by our PageChunker which is published
 * to Algolia.
 *
 * Duplicated interface that must match `/lit-dev-tools-cjs/src/search/plugin.ts`
 */
interface UserFacingPageData {
  objectID: string;
  relativeUrl: string;
  title: string;
  heading: string;
  text: string;
  parentID?: string;
  docType: DocTypes;
  isExternal?: boolean;
}

/**
 * Algolia result that returns stringified HTML that is highlighted.
 */
type HighlightOrSnippetResult<T> = {
  [key in keyof T]: {
    value: string;
  };
};

/**
 * Subset of the suggestion returned by Algolia when there is a matching search
 * result.
 */
type Suggestion = Omit<UserFacingPageData, 'text' | 'heading'> & {
  _highlightResult: Pick<
    HighlightOrSnippetResult<UserFacingPageData>,
    'title' | 'heading'
  >;
  _snippetResult: Pick<HighlightOrSnippetResult<UserFacingPageData>, 'text'>;
};

/**
 * Search suggestions grouped by title and content type.
 */
interface SuggestionGroup {
  suggestions: Suggestion[];
  type: string;
  tag: string;
}

/**
 * A data structure that takes in a list of Suggestions, groups them by
 * parentID, reformats the data for rendering, and then de-ranks the tutorial
 * results.
 */
class SuggestionGroups {
  private orderedPageIds: string[] = [];
  private orderedTutorialPageIds: string[] = [];
  private pageIdToSuggestionGroup: Map<string, SuggestionGroup> = new Map();

  constructor(suggestions: Suggestion[]) {
    suggestions.forEach((suggestion) => this.add(suggestion));
  }

  /**
   * Adds a suggestion to the data structure. If the suggestion is a tutorial,
   * it is added to the end of the list of tutorials. Otherwise, it is added to
   * the end of it's corresponding group. If there is no corresponding group,
   * one will be created. (performance O(suggestions))
   *
   * @param suggestion Suggestion to add to data structure.
   */
  add(suggestion: Suggestion) {
    const id = suggestion.parentID ?? suggestion.objectID;
    const suggestionGroup = this.pageIdToSuggestionGroup.get(id) ?? {
      ...suggestion.docType,
      suggestions: [],
    };

    // This is the first time we've encountered this parentID
    if (!suggestionGroup.suggestions.length) {
      this.pageIdToSuggestionGroup.set(id, suggestionGroup);

      // If this is a tutorial, add it to the end of the tutorial list which
      // will be rendered after the other suggestions.
      if (suggestion.docType.tag === 'tutorial') {
        this.orderedTutorialPageIds.push(id);
      } else {
        this.orderedPageIds.push(id);
      }
    }

    if (!suggestion.parentID) {
      // If it's the title link, prepend it so it shows up first.
      suggestionGroup.suggestions.unshift(suggestion);
    } else {
      suggestionGroup.suggestions.push(suggestion);
    }
  }

  /**
   * Gets a suggestion group by it's parentID.
   *
   * @param key The parentID of the suggestion group.
   * @returns The suggestion group associated with the given parentID.
   */
  get(key: string) {
    return this.pageIdToSuggestionGroup.get(key);
  }

  /**
   * Iterates through all page IDs as they were added to the data structure, and
   * then iterates through all tutorial IDs as they were added to the structure.
   */
  *[Symbol.iterator]() {
    yield* this.orderedPageIds[Symbol.iterator]();
    yield* this.orderedTutorialPageIds[Symbol.iterator]();
  }
}

/**
 * Search input component that can fuzzy search the site.
 *
 * @fires close - Fired when the escape key or cancel button is pressed.
 */
@customElement('litdev-search')
export class LitDevSearch extends LitElement {
  /**
   * The search icon to display in the textfield
   */
  @property() searchIconSrc = '/images/search.svg';

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
        <div class="icon">
          <lazy-svg loading="eager" href=${this.searchIconSrc}></lazy-svg>
        </div>
        <button @click=${() => this.dispatchEvent(new Event('close'))}>
          Cancel
        </button>
      </div>
      ${this._searchText.length < 2 || items.length > 0
        ? html`
            <ul
              id="items"
              role="listbox"
              class=${classMap({expanded: items.length})}
            >
              ${this._renderGroups()}
            </ul>
          `
        : html`<div id="no-items">
            No results (<a
              href="${this.getGithubIssueUrl(this._searchText)}"
              target="_blank"
              >open issue</a
            >)
          </div>`}
    `;
  }

  /**
   * Renders the search combobox suggestions grouped by title and content type.
   */
  private _renderGroups() {
    // TODO move this to the onComplete callback of the search controller
    // once we release that feature in @lit-labs/task so that we don't do this
    // needlessly every render.
    const groupedSuggestions = new SuggestionGroups(
      this._searchController.value
    );

    // for aria-activedescendant we need each item in each group to have a
    // unique id. So we keep a running counter across all groups.
    let suggestionIndex = -1;

    return repeat(
      groupedSuggestions,
      (groupID) => groupID,
      (groupID) => {
        const suggestionGroup = groupedSuggestions.get(groupID)!;
        return html`<section class="group">
          ${this._renderGroupTitle(suggestionGroup)}
          ${repeat(
            suggestionGroup.suggestions,
            ({objectID}) => objectID,
            ({
              relativeUrl,
              _highlightResult,
              _snippetResult,
              parentID,
              isExternal,
            }) => {
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
                  .isSubsection="${!!parentID}"
                  .isExternal="${!!isExternal}"
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
    const firstSuggestion = this._searchController.value[0];
    this._selectedIndex = 0;
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

    this.dispatchEvent(new Event('close'));
  }

  focus() {
    this._inputEl.focus();
  }

  getGithubIssueUrl(searchText: string) {
    const githubIssueUrl = new URL('https://github.com/lit/lit.dev/issues/new');
    githubIssueUrl.searchParams.append(
      'title',
      `[docs] No search results for \`${searchText}\``
    );
    githubIssueUrl.searchParams.append(
      'body',
      `<!-- What type of content did you expect to see on lit.dev and explain why it should be on lit.dev -->`
    );
    githubIssueUrl.searchParams.append('labels', `Area: docs`);
    return githubIssueUrl.href;
  }

  static styles = css`
    :host {
      --_cancel-button-width: 70px;
      --_input-height: 50px;
      --_input-padding: 4px;
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

    #items {
      display: block;
      z-index: 1;
      padding: 0;
      max-height: 488px;
      overflow: auto;
      margin-inline: calc(-1 * var(--search-modal-padding-inline));
      margin-block-start: var(--_items-margin-block-start);
      margin-block-end: calc(-1 * var(--search-modal-padding-block));
      padding-block-end: var(--search-modal-padding-block);
      padding-inline: var(--search-modal-padding-inline);
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

    #no-items {
      margin: 17px 0 6px;
      color: var(--color-dark-gray);
      text-align: center;
    }

    input {
      width: 100%;
      height: 100%;
      padding: var(--_input-padding);
      box-sizing: border-box;
      background-color: transparent;
      color: currentColor;
      font-size: 1.5em;
      font-family: inherit;
      font-weight: inherit;
      border-style: solid;
      border-color: var(--color-blue);
      border-width: 0 0 var(--_input-border-width) 0;
      outline: none;
    }

    input:focus {
      border-width: 0 0 var(--_input-border-width-focus) 0;
      padding-block-end: calc(
        var(--_input-padding) -
          (var(--_input-border-width-focus) - var(--_input-border-width))
      );
    }

    .icon {
      position: absolute;
      display: flex;
      align-items: center;
      height: 100%;
      inset-inline-end: var(--_input-padding);
    }

    input:focus ~ .icon lazy-svg::part(svg) {
      opacity: 1;
    }

    lazy-svg::part(svg) {
      color: var(--color-blue);
      inset-block-start: 0;
      pointer-events: none;
      opacity: 0.5;
      width: 32px;
      height: 32px;
      transition: opacity 0.5s;
    }

    .group {
      margin-block-start: 12px;
    }

    .group .descriptor {
      color: var(--color-blue);
      font-size: 20px;

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
      border-radius: 2px;
      font-size: 16px;
      padding: 0 0.5em;
    }

    .group .tag.article {
      background-color: #f9a012;
    }

    .group .tag.docs {
      color: white;
      background-color: #324fff;
    }

    .group .tag.video {
      color: white;
      background-color: #eb0000;
    }

    .group .tag.tutorial {
      color: black;
      background-color: #40dcff;
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

      .icon {
        inset-inline-end: calc(
          var(--_input-padding) + var(--_cancel-button-width)
        );
      }

      #items {
        max-height: calc(
          100dvh - var(--_input-height) - 2 * var(--search-modal-padding-block) -
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
