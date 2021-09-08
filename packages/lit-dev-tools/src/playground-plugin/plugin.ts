/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {BlockingRenderer} from './blocking-renderer.js';
import {outdent} from 'outdent';
import * as fs from 'fs/promises';
import {ProjectManifest} from 'playground-elements/shared/worker-api.js';

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

  eleventyConfig.on('beforeBuild', () => {
    renderer = new BlockingRenderer();
  });

  eleventyConfig.on('afterBuild', async () => {
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
          'initialized in "beforeBuild" event.'
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
    const config = await readProjectConfig(project);

    // Note we explicitly set "height" here so that the pre-upgrade height is
    // correct, to prevent layout shift.
    const editorHeight = config.editorHeight ?? '300px';
    const previewHeight = config.previewHeight ?? '120px';
    return `
    <litdev-example ${sandboxUrl ? `sandbox-base-url='${sandboxUrl}'` : ''}
      style="--litdev-example-editor-height:${editorHeight};
             --litdev-example-preview-height:${previewHeight}"
      project=${project}
    >
    </litdev-example>
  `.trim();
  });

  type LitProjectConfig = ProjectManifest & {
    editorHeight?: string;
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

      const config = await readProjectConfig(project);
      if (!config.files?.[filename]) {
        throw new Error(
          `Could not find file "${filename}" in playground project "${project}"`
        );
      }

      // Note we explicitly set "height" here so that the pre-upgrade height is
      // correct, to prevent layout shift.
      const editorHeight = config.editorHeight ?? '300px';
      const previewHeight = config.previewHeight ?? '120px';
      return `
      <litdev-example ${sandboxUrl ? `sandbox-base-url='${sandboxUrl}'` : ''}
        style="--litdev-example-editor-height:${editorHeight};
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
      /^\s*\n\n```ts\n(.+)\n```\s+```js\n(.+)\n```\s*$/s
    );
    if (match === null) {
      throw new Error(
        'Invalid {% switchable-sample %}.' +
          ' Expected one ```ts block followed by one ```js block.' +
          ' There also must be a blank line between the {% switchable-sample %} and the ```ts block.'
      );
    }
    // Set one of the "extra-lines" CSS properties depending on whether the TS
    // or JS version is longer. This will be used to reserve additional space on
    // one or the other version, so that there is no layout shift when the
    // language is switched.
    const tsCodeLines = match[1].split('\n').length;
    const jsCodeLines = match[2].split('\n').length;
    let styleAttr;
    if (tsCodeLines > jsCodeLines) {
      styleAttr = ` style="--js-extra-lines:${tsCodeLines - jsCodeLines}"`;
    } else if (tsCodeLines < jsCodeLines) {
      styleAttr = ` style="--ts-extra-lines:${jsCodeLines - tsCodeLines}"`;
    } else {
      styleAttr = ``;
    }
    return `<litdev-switchable-sample${styleAttr}>${content}</litdev-switchable-sample>`;
  });

  eleventyConfig.addMarkdownHighlighter(
    (code: string, lang: 'js' | 'ts' | 'html' | 'css') => render(code, lang)
  );
};
