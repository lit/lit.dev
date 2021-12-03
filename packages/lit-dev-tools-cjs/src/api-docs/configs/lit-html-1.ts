/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathlib from 'path';

import type {ApiDocsConfig} from '../types.js';

const root = pathlib.resolve(__dirname, '..', '..', '..', '..', '..');
const dataDir = pathlib.join(root, 'packages', 'lit-dev-api', 'api-data');
const workDir = pathlib.join(dataDir, 'lit-html-1');
const gitDir = pathlib.join(workDir, 'repo');
const srcDir = pathlib.join(gitDir, 'src');

/**
 * lit.dev API docs configuration for lit-html 1.x
 */
export const litHtml1Config: ApiDocsConfig = {
  repo: 'https://github.com/lit/lit',
  commit: '022f87d7d1f541738dfec130f3635a6962f53887',
  gitDir,
  tsConfigPath: pathlib.join(gitDir, 'tsconfig.json'),
  pagesOutPath: pathlib.join(workDir, 'pages.json'),
  symbolsOutPath: pathlib.join(workDir, 'symbols.json'),
  typedocRoot: srcDir,

  entrypointModules: [
    pathlib.join(srcDir, 'lit-html.ts'),
    pathlib.join(srcDir, 'lib', 'shady-render.ts'),
    pathlib.join(srcDir, 'directives', 'async-append.ts'),
    pathlib.join(srcDir, 'directives', 'async-replace.ts'),
    pathlib.join(srcDir, 'directives', 'cache.ts'),
    pathlib.join(srcDir, 'directives', 'class-map.ts'),
    pathlib.join(srcDir, 'directives', 'guard.ts'),
    pathlib.join(srcDir, 'directives', 'if-defined.ts'),
    pathlib.join(srcDir, 'directives', 'live.ts'),
    pathlib.join(srcDir, 'directives', 'repeat.ts'),
    pathlib.join(srcDir, 'directives', 'style-map.ts'),
    pathlib.join(srcDir, 'directives', 'template-content.ts'),
    pathlib.join(srcDir, 'directives', 'unsafe-html.ts'),
    pathlib.join(srcDir, 'directives', 'unsafe-svg.ts'),
    pathlib.join(srcDir, 'directives', 'until.ts'),
  ],

  symbolOrder: [],

  pages: [
    {
      slug: 'templates',
      title: 'Templates',
      versionLinks: {
        v2: 'api/templates/',
      },
    },
    {
      slug: 'directives',
      title: 'Directives',
      versionLinks: {
        v2: 'api/directives/',
      },
    },
    {
      slug: 'custom-directives',
      title: 'Custom directives',
      versionLinks: {
        v2: 'api/custom-directives/',
      },
    },
    {
      slug: 'misc',
      title: 'Misc',
      versionLinks: {
        v2: 'api/misc/',
      },
    },
    {
      slug: 'shady',
      title: 'ShadyCSS/DOM',
      versionLinks: {
        v2: 'api/templates/',
      },
    },
  ],

  pageForSymbol(node): string {
    const entrypoint = node.entrypointSources?.[0]?.fileName ?? '';
    const source = node.sources?.[0].fileName;
    if (entrypoint.includes('shady-render')) {
      return 'shady';
    }
    if (
      source === 'src/lib/template-result.ts' ||
      node.name === 'html' ||
      node.name === 'nothing' ||
      node.name === 'render' ||
      node.name === 'RenderOptions' ||
      node.name === 'svg'
    ) {
      return 'templates';
    }
    if (entrypoint.includes('/directives/')) {
      return 'directives';
    }
    if (
      source === 'src/lib/parts.ts' ||
      source === 'src/lib/directive.ts' ||
      node.name === 'AttributeCommitter' ||
      node.name === 'AttributePart' ||
      node.name === 'BooleanAttributePart' ||
      node.name === 'createMarker' ||
      node.name === 'defaultTemplateProcessor' ||
      node.name === 'DefaultTemplateProcessor' ||
      node.name === 'directive' ||
      node.name === 'EventPart' ||
      node.name === 'isTemplatePartActive' ||
      node.name === 'noChange' ||
      node.name === 'Part' ||
      node.name === 'parts' ||
      node.name === 'PropertyPart' ||
      node.name === 'removeNodes' ||
      node.name === 'reparentNodes' ||
      node.name === 'Template' ||
      node.name === 'templateCaches' ||
      node.name === 'templateFactory' ||
      node.name === 'TemplateInstance' ||
      node.name === 'TemplateProcessor'
    ) {
      return 'custom-directives';
    }
    return 'misc';
  },

  locationToUrl({page, anchor}) {
    return `/docs/v1/api/lit-html/${page}/#${anchor}`;
  },

  fileToImportSpecifier(filename) {
    const match = filename.match(/^src\/(.+).ts$/);
    if (!match) {
      throw new Error(`Unexpected filename ${filename}`);
    }
    const [_, module] = match;
    if (module === 'lit-html') {
      return 'lit-html'; // default module
    }
    return `lit-html/${module}.js`;
  },
};
