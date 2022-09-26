/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html, TemplateResult} from 'lit';

/**
 * When given an algolia search snippet that is the stringified HTML of `<em>`s
 * this fucntion will return a sanitized Lit template that is renderable.
 *
 * @param snippet The algolia snippet to sanitize into a lit template.
 * @returns A sanitized lit template.
 */
export const renderAlgoliaSnippet = (
  snippet: string
): TemplateResult | string => {
  // Algloia snippets have stringified HTML like so:
  // 'Baz <em>Foo</em> bar <em>Foo</em>z'.
  // It is always an <em>
  const match = snippet.match(/<em>(.*?)<\/em>/);
  if (!match || match.index === undefined) {
    return snippet;
  }
  const fullMatch = match[0]; // <em>Foo</em>
  const emContent = match[1]; // Foo
  const start = snippet.slice(0, match.index); // Baz
  const end = snippet.slice(match.index + fullMatch.length); // bar <em>Foo</em>z

  return html`${start}<em>${emContent}</em>${renderAlgoliaSnippet(end)}`;
};
