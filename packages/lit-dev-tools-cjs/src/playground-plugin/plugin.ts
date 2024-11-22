/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {BlockingRenderer} from './blocking-renderer.js';
import {outdent} from 'outdent';
import * as fs from 'fs/promises';

import type {ProjectManifest} from 'playground-elements/shared/worker-api.js';
export type AsideVariant = 'positive' | 'negative' | 'warn' | 'info' | 'labs';

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
  {sandboxUrl, isDevMode}: {sandboxUrl: string; isDevMode: boolean}
) => {
  let renderer: BlockingRenderer | undefined;

  eleventyConfig.on('eleventy.before', () => {
    renderer = new BlockingRenderer({isDevMode});
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

  eleventyConfig.addShortcode(
    'playground-ide',
    async (project: string, lazy = false) => {
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
      // in the case `lazy` is false, we need to keep the ">" character on the
      // line right after the last attribute or else markdown will not render
      // the closing tag correctly because it will be in a  `<p>></p>`.
      return `
    <litdev-example ${sandboxUrl ? `sandbox-base-url="${sandboxUrl}"` : ''}
      style="--litdev-example-editor-lines-ts:${numVisibleLines.ts};
             --litdev-example-editor-lines-js:${numVisibleLines.js};
             --litdev-example-preview-height:${previewHeight};"
      project="${project}"
      ${lazy ? 'lazy' : ''}>
    </litdev-example>
  `.trim();
    }
  );

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

  const neverReach = (_value: never, error: string): never => {
    throw new Error(error);
  };

  /**
   * An aside for extra information.
   *
   * Usage:
   *
   *   {% aside "positive" %}
   *
   *   Here is some content! This line is bolded.
   *
   *   This line is not bolded but on the same line as the previous one.
   *
   *   This line is another paragraph
   *
   *   {% endaside %}
   *
   *   {% aside "info" "no-header" %}
   *
   *   This one does not have a bolded header.
   *
   *   {% endaside %}
   */
  eleventyConfig.addPairedShortcode(
    'aside',
    (content: string, variant: AsideVariant, noHeader = '') => {
      const acceptableVariants = [
        'info',
        'warn',
        'positive',
        'negative',
        'labs',
      ] as const;

      // If statement needs to be written this way to assert exhaustive check.
      if (
        acceptableVariants[0] !== variant &&
        acceptableVariants[1] !== variant &&
        acceptableVariants[2] !== variant &&
        acceptableVariants[3] !== variant &&
        acceptableVariants[4] !== variant
      ) {
        // This will throw an error at runtime if it does not match and will
        // throw a TS build time error if we add another variant and forget to
        // update this file.
        neverReach(
          variant,
          `Invalid {% aside ${variant} %}.` +
            ` variant "${variant}" is not an acceptable variant of:` +
            ` ${acceptableVariants.join(', ')}.`
        );
      }

      const noHeaderAttribute = noHeader === 'no-header' ? ' no-header' : '';

      // Matches the first line's leading whitespace and applies it to the other
      // HTML nodes to preserve the same indentation.
      const contentIndent = (content.match(/^\s*/) ?? [''])[0];

      // htmlmin:ignore will prevent minifier from formatting the contents.
      // otherwise, in the prod build, there will not be a space between the
      // bolded header and the second line.
      return (
        `${contentIndent}<litdev-aside type="${variant}"${noHeaderAttribute}>` +
        `\n${contentIndent}<!-- htmlmin:ignore -->\n\n` +
        content +
        `\n\n${contentIndent}<!-- htmlmin:ignore -->` +
        `\n${contentIndent}</litdev-aside>`
      );
    }
  );

  eleventyConfig.addShortcode('labs-disclaimer', () => {
    return `<litdev-aside type="labs" no-header>
        This package is part of the Lit Labs family of experimental packages. See the <a href="/docs/libraries/labs">Lit Labs</a> page for guidance on using Labs software in production.
      </litdev-aside>`;
  });

  eleventyConfig.addMarkdownHighlighter(
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );
};

const trimTrailingSlash = (str: string) =>
  str.endsWith('/') ? str.slice(0, str.length - 1) : str;
