/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {BlockingRenderer} from './blocking-renderer.js';
import {outdent} from 'outdent';
import * as fs from 'fs/promises';

import type {ProjectManifest} from 'playground-elements/shared/worker-api.js';

// TODO(aomarks) There seem to be no typings for 11ty! This person has made
// some, but they're not in DefinitelyTyped:
// https://github.com/chriskrycho/v5.chriskrycho.com/blob/master/types/eleventy.d.ts
interface EleventyConfig {
  addShortcode(
    name: string,
    shortcode: (...args: any[]) => string | Promise<string>
  ): void | Promise<string>;
  addPairedShortcode(
    name: string,
    shortcode: (content: string, ...args: any[]) => string | Promise<string>
  ): void;
  addMarkdownHighlighter(fn: (content: string, lang: any) => string): void;
  on(name: string, fn: () => void): void;
}

/**
 * Returns the number of lines that the given file in the given project has,
 * accounting for hidden regions.
 */
const getNumVisibleLinesForProjectFile = async (
  project: string,
  filename: string
): Promise<{ts: number; js: number}> => {
  const tsData = await fs.readFile(`samples/${project}/${filename}`, 'utf8');
  const tsLines = countVisibleLines(filename, tsData);
  let jsLines;
  if (filename.endsWith('.ts')) {
    const jsFilename = filename.replace(/\.ts$/, '.js');
    const jsData = await fs.readFile(
      `samples/js/${project}/${jsFilename}`,
      'utf8'
    );
    jsLines = countVisibleLines(jsFilename, jsData);
  } else {
    jsLines = tsLines;
  }
  return {ts: tsLines, js: jsLines};
};

const countVisibleLines = (filename: string, code: string): number => {
  let count = code.split('\n').length;
  // For reference see:
  // https://github.com/PolymerLabs/playground-elements/blob/ce3e12e6e23bcd3e0b2cbfc3584a1191c3ca6663/src/playground-code-editor.ts#L486
  const pattern = filename.endsWith('.html')
    ? /( *<!-- *playground-(?<kind>hide|fold) *-->\n?)(?:(.*?)( *<!-- *playground-\k<kind>-end *-->\n?))?/gs
    : /( *\/\* *playground-(?<kind>hide|fold) *\*\/\n?)(?:(.*?)( *\/\* *playground-\k<kind>-end *\*\/\n?))?/gs;
  for (const [content, , kind] of code.matchAll(pattern)) {
    // Remove the lines within the hidden/folded region.
    count -= content.split('\n').length;
    if (kind === 'fold') {
      // In the fold case a clickable "..." is put in its place. For some
      // reason, these lines have slightly more height than a normal code line.
      // TODO(aomarks) Ideally these would be the same height. Investigate in
      // CodeMirror/Playground.
      count += 1.03;
    }
  }
  return count;
};

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
  {sandboxUrl}: {sandboxUrl: string}
) => {
  let renderer: BlockingRenderer | undefined;

  eleventyConfig.on('eleventy.before', () => {
    renderer = new BlockingRenderer();
  });

  eleventyConfig.on('eleventy.after', async () => {
    if (renderer) {
      const old = renderer;
      renderer = undefined;
      await old.stop();
    }
  });

  const render = (code: string, lang: 'js' | 'ts' | 'html' | 'css') => {
    if (!renderer) {
      throw new Error(
        'Internal error: expected Playground renderer to have been ' +
          'initialized in "eleventy.before" event.'
      );
    }
    const {html} = renderer.render(lang, outdent`${code}`);
    return html;
  };

  const readProjectConfig = async (
    project: string
  ): Promise<LitProjectConfig> => {
    const path = `samples/${project}/project.json`;

    let json;
    try {
      json = await fs.readFile(path, 'utf8');
    } catch (e) {
      throw new Error(
        `Invalid playground project "${project}". ` +
          `Could not read file "${path}": ${e}`
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      throw new Error(
        `Invalid JSON in playground project config "${path}": ${e}`
      );
    }

    for (const filename of Object.keys(parsed.files || {})) {
      const filepath = `samples/${project}/${filename}`;
      try {
        await fs.readFile(filepath, 'utf8');
      } catch (e) {
        throw new Error(
          `Missing playground file "${filename}" in project "${project}": ${e}`
        );
      }
    }

    return parsed as LitProjectConfig;
  };

  eleventyConfig.addPairedShortcode(
    'highlight',
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );

  eleventyConfig.addMarkdownHighlighter(
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );

  eleventyConfig.addShortcode('playground-ide', async (project: string) => {
    if (!project) {
      throw new Error(
        `Invalid playground-ide invocation.` +
          `Usage {% playground-ide "path/to/project" %}`
      );
    }
    project = trimTrailingSlash(project);
    const config = await readProjectConfig(project);
    const firstFilename = Object.keys(config.files ?? {})[0];
    const numVisibleLines = await getNumVisibleLinesForProjectFile(
      project,
      firstFilename
    );
    const previewHeight = config.previewHeight ?? '120px';
    return `
    <litdev-example ${sandboxUrl ? `sandbox-base-url='${sandboxUrl}'` : ''}
      style="--litdev-example-editor-lines-ts:${numVisibleLines.ts};
             --litdev-example-editor-lines-js:${numVisibleLines.js};
             --litdev-example-preview-height:${previewHeight}"
      project=${project}
    >
    </litdev-example>
  `.trim();
  });

  type LitProjectConfig = ProjectManifest & {
    previewHeight?: string;
  };

  // TODO(aomarks)
  // - Pre-render highlighted code and preview. Slots are already available.
  // - Add a "load in playground" button.
  // - Support "masking out" parts of the code, so that only some bits are
  //   visible and editable (e.g. just the contents of a lit template).
  eleventyConfig.addShortcode(
    'playground-example',
    async (project: string, filename: string) => {
      if (!project || !filename) {
        throw new Error(
          `Invalid playground-example invocation.` +
            `Usage {% playground-example "project/dir" "filename.js" %}`
        );
      }
      project = trimTrailingSlash(project);
      const config = await readProjectConfig(project);
      if (!config.files?.[filename]) {
        throw new Error(
          `Could not find file "${filename}" in playground project "${project}"`
        );
      }
      const numVisibleLines = await getNumVisibleLinesForProjectFile(
        project,
        filename
      );
      const previewHeight = config.previewHeight ?? '120px';
      return `
      <litdev-example ${sandboxUrl ? `sandbox-base-url='${sandboxUrl}'` : ''}
        style="--litdev-example-editor-lines-ts:${numVisibleLines.ts};
               --litdev-example-editor-lines-js:${numVisibleLines.js};
               --litdev-example-preview-height:${previewHeight}"
        project=${project}
        filename=${filename}
      >
      </litdev-example>
    `.trim();
    }
  );

  /**
   * A static highlighted code snippet which can be toggled between JavaScript
   * and TypeScript.
   *
   * Usage:
   *
   *   {% switchable-sample %}
   *
   *   ```ts
   *   const foo: string = 123;
   *   ```
   *
   *   ```js
   *   const foo = 123;
   *   ```
   *
   *   {% endswitchable-sample %}
   */
  eleventyConfig.addPairedShortcode('switchable-sample', (content: string) => {
    const match = content.match(
      /^\s*\n\n\s*```ts\n(.+)\n\s*```\s+```js\n(.+)\n\s*```\s*$/s
    );
    if (match === null) {
      throw new Error(
        'Invalid {% switchable-sample %}.' +
          ' Expected one ```ts block followed by one ```js block.' +
          ' There also must be a blank line between the {% switchable-sample %} and the ```ts block.'
      );
    }
    return `<litdev-switchable-sample>${content}</litdev-switchable-sample>`;
  });

  eleventyConfig.addMarkdownHighlighter(
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );
};

const trimTrailingSlash = (str: string) =>
  str.endsWith('/') ? str.slice(0, str.length - 1) : str;
