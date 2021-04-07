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
  _pluginOptions?: {}
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
    const styleHeight = config.editorHeight
      ? `style="height: ${config.editorHeight};"`
      : '';
    const lineNumbers = config.lineNumbers ? 'line-numbers' : '';
    return `
      <playground-ide ${styleHeight}
      ${lineNumbers} resizable editable-file-system
        project-src="/samples/${project}/project.json">
      </playground-ide>
    `.trim();
  });

  type LitProjectConfig = ProjectManifest & {
    editorHeight?: string;
    previewHeight?: string;
    lineNumbers?: boolean;
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
      <litdev-example
        style="height:calc(${editorHeight} + ${previewHeight});
               --litdev-example-editor-height:${editorHeight};
               --litdev-example-preview-height:${previewHeight}"
        project=${project}
        filename=${filename}
      >
      </litdev-example>
    `.trim();
    }
  );
};
