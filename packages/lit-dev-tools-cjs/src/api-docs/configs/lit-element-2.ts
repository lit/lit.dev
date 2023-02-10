/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathlib from 'path';

import type {ApiDocsConfig} from '../types.js';

const root = pathlib.resolve(__dirname, '..', '..', '..', '..', '..');
const dataDir = pathlib.join(root, 'packages', 'lit-dev-api', 'api-data');
const workDir = pathlib.join(dataDir, 'lit-element-2');
const gitDir = pathlib.join(workDir, 'repo');
const srcDir = pathlib.join(gitDir, 'src');

/**
 * lit.dev API docs configuration for lit-element 2.x
 */
export const litElement2Config: ApiDocsConfig = {
  repo: 'lit/lit-element',
  commit: 'c9b40e6b26dd7a9361e32421a4343949d242e0ca',
  workDir,
  gitDir,
  pagesOutPath: pathlib.join(workDir, 'pages.json'),
  symbolsOutPath: pathlib.join(workDir, 'symbols.json'),
  typedocRoot: srcDir,

  packages: [
    {
      tsConfigPath: pathlib.join(gitDir, 'tsconfig.json'),
      entrypointModules: [
        pathlib.join(srcDir, 'lit-element.ts'),
        pathlib.join(srcDir, 'decorators.ts'),
        pathlib.join(srcDir, 'lib', 'updating-element.ts'),
      ],
    }
  ],

  symbolOrder: [],

  pages: [
    {
      slug: 'LitElement',
      title: 'LitElement',
      versionLinks: {
        v2: 'api/LitElement/',
      },
    },
    {
      slug: 'UpdatingElement',
      title: 'UpdatingElement',
      versionLinks: {
        v2: 'api/ReactiveElement/',
      },
    },
    {
      slug: 'styles',
      title: 'Styles',
      versionLinks: {
        v2: 'api/styles/',
      },
    },
    {
      slug: 'decorators',
      title: 'Decorators',
      versionLinks: {
        v2: 'api/decorators/',
      },
    },
    {
      slug: 'misc',
      title: 'Misc',
      versionLinks: {
        v2: 'api/misc/',
      },
    },
  ],

  pageForSymbol(node): string {
    const source = node.sources?.[0].fileName;
    if (node.name === 'LitElement') {
      return 'LitElement';
    }
    // Not sure why this config is getting full paths, but like-html-1 is
    // getting relative paths from the srcRoot.
    if (source?.endsWith('src/lib/updating-element.ts')) {
      return 'UpdatingElement';
    }
    if (source?.endsWith('src/lib/decorators.ts')) {
      return 'decorators';
    }
    if (
      node.name.startsWith('CSS') ||
      node.name === 'adoptStyles' ||
      node.name === 'css' ||
      node.name === 'getCompatibleStyle' ||
      node.name === 'supportsAdoptingStyleSheets' ||
      node.name === 'unsafeCSS'
    ) {
      return 'styles';
    }
    return 'misc';
  },

  locationToUrl({page, anchor}) {
    return `/docs/v1/api/lit-element/${page}/#${anchor}`;
  },

  fileToImportSpecifier(filename) {
    const match = filename.match(/^src\/(.+).ts$/);
    if (!match) {
      throw new Error(`Unexpected filename ${filename}`);
    }
    const [_, module] = match;
    if (module === 'lit-element') {
      return 'lit-element'; // default module
    }
    return `lit-element/${module}.js`;
  },
};
