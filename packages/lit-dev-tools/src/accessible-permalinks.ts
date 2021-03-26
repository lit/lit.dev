/**
 * @license
 * Copyright 2021 Nicolas Hoizey
 * SPDX-License-Identifier: MIT
 */

import type {AnchorOptions} from 'markdown-it-anchor';
import type StateCore from 'markdown-it/lib/rules_core/state_core.js';

/**
 * Makes a function that renders an accessible anchor link for the
 * `markdown-it-anchor` `renderPermalink` parameter.
 *
 * The default permalink renderer puts the permalink directly in the heading
 * element. This gets read aloud by screen readers as literal text, and also
 * doesn't work well with `eleventy-plugin-nesting-toc`.
 *
 * This instead renders like:
 *
 *   <div class="${wrapperClassName} h3">
 *     <h3 id="heading-id">Heading title</h3>
 *     <a class="${permalinkClass}" href="#heading-id">
 *       <span aria-hidden="true">
 *         ${permalinkSymbol}
 *       </span>
 *       <span class="${offscreenClass}">
 *         Permalink to Heading title
 *       </span>
 *     </a>
 *   </div>
 *
 * Based on
 * https://nicolas-hoizey.com/articles/2021/02/25/accessible-anchor-links-with-markdown-it-and-eleventy/
 * which is based on
 * https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/
 */
export const accessiblePermalink = ({
  wrapperClassName,
  offscreenClass,
}: {
  wrapperClassName: string;
  offscreenClass: string;
}): AnchorOptions['renderPermalink'] => (
  slug: string,
  opts: AnchorOptions,
  stateParam: Parameters<
    Exclude<AnchorOptions['renderPermalink'], undefined>
  >[2],
  idx: number
) => {
  // This type is slightly wrong.
  const state = (stateParam as unknown) as StateCore;

  const headingTag = state.tokens[idx].tag;
  if (!headingTag.match(/^h[123456]$/)) {
    throw new Error(`Expected token to be a h1-6: ${headingTag}`);
  }
  const linkContent = state.tokens[idx + 1].content;

  // Create the opening <div> for the wrapper
  const headingWrapperTokenOpen = Object.assign(
    new state.Token('div_open', 'div', 1),
    {
      attrs: [['class', `${wrapperClassName} ${headingTag}`]],
    }
  );

  // Create the closing </div> for the wrapper
  const headingWrapperTokenClose = Object.assign(
    new state.Token('div_close', 'div', -1),
    {
      attrs: [['class', wrapperClassName]],
    }
  );

  const anchorTokens = [
    Object.assign(new state.Token('link_open', 'a', 1), {
      attrs: [
        ...(opts.permalinkClass ? [['class', opts.permalinkClass]] : []),
        ['href', opts.permalinkHref!(slug, stateParam)],
        ...Object.entries(opts.permalinkAttrs!(slug, stateParam)),
      ],
    }),
    Object.assign(new state.Token('span_open', 'span', 1), {
      attrs: [['aria-hidden', 'true']],
    }),
    Object.assign(new state.Token('html_block', '', 0), {
      content: opts.permalinkSymbol,
    }),
    Object.assign(new state.Token('span_close', 'span', -1), {}),
    Object.assign(new state.Token('span_open', 'span', 1), {
      attrs: [['class', offscreenClass]],
    }),
    Object.assign(new state.Token('html_block', '', 0), {
      content: `Permalink to ${linkContent}`,
    }),
    Object.assign(new state.Token('span_close', 'span', -1), {}),
    new state.Token('link_close', 'a', -1),
  ];

  // idx is the index of the heading's first token
  // insert the wrapper opening before the heading
  state.tokens.splice(idx, 0, headingWrapperTokenOpen);
  // insert the anchor link tokens after the wrapper opening and the 3 tokens of the heading
  state.tokens.splice(idx + 3 + 1, 0, ...anchorTokens);
  // insert the wrapper closing after all these
  state.tokens.splice(
    idx + 3 + 1 + anchorTokens.length,
    0,
    headingWrapperTokenClose
  );
};
