/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {BlockingRenderer} from './blocking-renderer.js';
import {Reaper} from './reaper.js';
import {outdent} from 'outdent';

// TODO(aomarks) There seem to be no typings for 11ty! This person has made
// some, but they're not in DefinitelyTyped:
// https://github.com/chriskrycho/v5.chriskrycho.com/blob/master/types/eleventy.d.ts
interface EleventyConfig {
  addPairedShortcode(
    name: string,
    shortcode: (content: string, ...args: any[]) => string
  ): void;
  addMarkdownHighlighter(fn: (content: string, lang: any) => string): void;
}

/**
 * Adds syntax highlighters using playground-elements.
 *
 * Markdown fences:
 *
 *   ```js
 *   console.log("Hello")
 *   ```
 *
 * Paired shortcode:
 *
 *   {% highlight "js" %}
 *   console.log("Hello");
 *   {% highlight %}
 */
export const playgroundPlugin = (
  eleventyConfig: EleventyConfig,
  _pluginOptions?: {}
) => {
  let renderer: BlockingRenderer | undefined;

  const getRenderer = () => {
    if (renderer === undefined) {
      renderer = new BlockingRenderer();
    }
    return renderer;
  };

  // We want to share one Playwright browser and HTTP server across code
  // renders, but there doesn't appear to be any "startup" and "shutdown" hooks
  // for an Eleventy plugin. So we instead just startup the first time we are
  // needed, and shutdown if there haven't been any calls within some time
  // window (and startup again if another render happens later).
  const reaper = new Reaper(async () => {
    if (renderer !== undefined) {
      const r = renderer;
      renderer = undefined;
      await r.stop();
    }
  }, 500);

  const render = (code: string, lang: 'js' | 'ts' | 'html' | 'css') => {
    const done = reaper.keepAlive();
    try {
      const {html} = getRenderer().render(lang, outdent`${code}`);
      return html;
    } finally {
      done();
    }
  };

  eleventyConfig.addPairedShortcode(
    'highlight',
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );

  eleventyConfig.addMarkdownHighlighter(
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );
};
