/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {Renderer} from './renderer.js';
import {Reaper} from './reaper.js';

// TODO(aomarks) There seem to be no typings for 11ty! This person has made
// some, but they're not in DefinitelyTyped:
// https://github.com/chriskrycho/v5.chriskrycho.com/blob/master/types/eleventy.d.ts
interface EleventyConfig {
  addPairedShortcode(
    name: string,
    shortcode: (content: string, ...args: any[]) => string | Promise<string>
  ): void;
}

/**
 * Adds the "playground-highlight" paired-shortcode. Example usage:
 *
 *   {% playground-highlight "js" %}
 *     console.log("Hello");
 *   {% playground-highlight %}
 */
export const playgroundPlugin = (
  eleventyConfig: EleventyConfig,
  _pluginOptions?: {}
) => {
  let rendererPromise: Promise<Renderer> | undefined;

  const getRenderer = () => {
    if (rendererPromise === undefined) {
      rendererPromise = Renderer.start();
    }
    return rendererPromise;
  };

  // We want to share one Playwright browser and HTTP server across code
  // renders, but there doesn't appear to be any "startup" and "shutdown" hooks
  // for an Eleventy plugin. So we instead just startup the first time we are
  // needed, and shutdown if there haven't been any calls within some time
  // window (and startup again if another render happens later).
  const reaper = new Reaper(async () => {
    if (rendererPromise !== undefined) {
      const p = rendererPromise;
      rendererPromise = undefined;
      const renderer = await p;
      await renderer.stop();
    }
  }, 500);

  eleventyConfig.addPairedShortcode(
    'playground-highlight',
    async (content: string, type: 'js' | 'ts' | 'html' | 'css') => {
      const done = reaper.keepAlive();
      try {
        const renderer = await getRenderer();
        const {html} = await renderer.render(type, content);
        return html;
      } finally {
        done();
      }
    }
  );
};
