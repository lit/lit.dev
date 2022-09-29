/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {JSDOM} from 'jsdom';
import striptags from 'striptags';
import stripcomments from 'strip-comments';

/**
 * A page chunk represents a section of a lit.dev page that starts with a
 * heading, and all following content until the next heading demarkates another
 * chunk.
 *
 * Text has been sanitized and contains all necessary metadata required for the
 * search index.
 *
 * We split a page either by the h1 at the top, or h2 tags accompanied by anchor
 * fragments. Each of these chunks show up as individual entries in the search
 * dropdown.
 */
export interface PageSearchDataChunk {
  title: string;
  heading: string;
  text: string;
  fragment?: string;
  isParent: boolean;
}

/**
 * Internal representation of a page chunk before text sanitizing.
 */
interface PageDataChunk {
  heading: string;
  fragment: string;
  nodeCollection: HTMLDivElement;
  isParent: boolean;
}

/**
 * Converts the group of elements into sanitized text that is easily searchable.
 * Sanitized text is stripped of html, some html character codes and
 * punctuation.
 */
function dataChunktoSearchChunk(
  {heading, fragment, nodeCollection, isParent}: PageDataChunk,
  title: string
): PageSearchDataChunk {
  const withoutComments = stripcomments(nodeCollection.outerHTML);
  // Leave a space when removing tags so we don't accidentally concat text from
  // adjacent tags. Thus `<h1>Hi</h1><p>hi</p>` becomes ` Hi  hi `.
  const withoutTags = striptags(withoutComments, undefined, ' ');
  return {
    title,
    heading,
    fragment,
    text: withoutTags
      // Remove common escaped characters that otherwise become invalid words.
      .replace(/(&lt;)|(&gt;)/g, '')
      // Remove all symbols and punctuation.
      .replace(/[^\p{Letter}\s]/gu, '')
      // Space everything evenly apart.
      .replace(/\s+/g, ' ')
      .trim(),
    isParent,
  };
}

/**
 * PageSearchChunker takes the raw html of a lit.dev page in as input, and
 * processes the page into groups of text that can be placed in a search index.
 */
export class PageSearchChunker {
  /**
   * Parsed lit.dev page in virtual DOM.
   */
  private parsedPage: JSDOM;

  constructor(htmlContent: string) {
    this.parsedPage = new JSDOM(htmlContent, {contentType: 'text/html'});
  }

  /**
   * Retrieve page title.
   *
   * @throws Will throw if no title.
   */
  private get title(): string {
    const titleText = this.parsedPage.window.document.querySelector('title');
    if (!titleText?.textContent) {
      throw new Error(`Page is missing title`);
    }
    return titleText.textContent;
  }

  /**
   * Retrieves article#content element for parsed page with some elements that
   * we don't want to index in search removed.
   *
   * @throws Page must have an 'article#content' element.
   */
  private filteredArticleContent(): Element {
    const article =
      this.parsedPage.window.document.querySelector('article#content');
    if (!article) {
      throw new Error(
        `Expect every lit.dev page to have an article#content element.`
      );
    }
    const removedSections = article.querySelectorAll(
      'nav#inlineToc, header.articleHeader'
    );
    [...removedSections].forEach((section) => section.remove());
    return article;
  }

  /**
   * Create a new chunk of the page.
   */
  private newPageDataChunk({
    heading,
    fragment,
    isParent,
  }: {
    heading: string;
    fragment: string;
    isParent: boolean;
  }): PageDataChunk {
    return {
      heading,
      fragment,
      nodeCollection: this.parsedPage.window.document.createElement('div'),
      isParent,
    };
  }

  /**
   * This method is used on each direct child of the page contents to
   * demarkate if we should start a new page chunk.
   *
   * Will return a new chunk on a h1 tag, or element containing a h2 and
   * adjacent anchor tag containing a fragment.
   *
   * @param el Direct child of article contents.
   * @returns an optional new page chunk.
   * @throws Empty h2 with an anchor tag.
   */
  private tryCreateNewPageChunk(el: Element): PageDataChunk | null {
    if (el.tagName === 'H1') {
      return this.newPageDataChunk({
        heading: el.textContent ?? '',
        fragment: '',
        isParent: true,
      });
    }

    const possibleAnchor = el.querySelector(':scope > a');
    const possibleH2 = el.querySelector(':scope > h2');
    const possibleH3 = el.querySelector(':scope > h3');
    const possibleH4 = el.querySelector(':scope > h4');
    const possibleHeading = possibleH2 ?? possibleH3 ?? possibleH4;
    const fragment = possibleAnchor?.getAttribute('href');
    if (possibleAnchor && possibleHeading && fragment?.startsWith('#')) {
      const headerText = possibleHeading.textContent;
      if (!headerText) {
        throw new Error(
          `No textContent on header with fragment: '${fragment}'`
        );
      }
      return this.newPageDataChunk({
        heading: possibleHeading.textContent ?? '',
        fragment: fragment,
        isParent: false,
      });
    }

    return null;
  }

  /**
   * Returns the page broken into searchable chunks of sanitized text with
   * associated title, subheading and possible link fragment.
   *
   * @throws Page needs to be an expected layout.
   */
  pageSearchChunks(): PageSearchDataChunk[] {
    const articleContents = this.filteredArticleContent();
    const reducedPageChunks: PageDataChunk[] = [];

    // Need a shallow copy of the children so we're not mutating an live list.
    for (const childNode of Array.from(articleContents.children)) {
      const maybeNewPageChunk = this.tryCreateNewPageChunk(childNode);
      if (maybeNewPageChunk) {
        // Note, we skip adding the heading element to the `nodeCollection`, as
        // we've tracked the text in the title and/or heading fields. We don't
        // need to double index that text.
        reducedPageChunks.push(maybeNewPageChunk);
      } else {
        const lastChunk = reducedPageChunks[reducedPageChunks.length - 1];
        if (lastChunk !== null) {
          lastChunk.nodeCollection.appendChild(childNode);
        }
      }
    }

    if (reducedPageChunks.length === 0) {
      throw new Error(`We were unable to chunk page`);
    }

    const title = this.title;
    return reducedPageChunks.map((c) => dataChunktoSearchChunk(c, title));
  }
}
