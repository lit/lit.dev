/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathlib from 'path';
import {ReflectionKind} from 'typedoc';
import {lit2Config} from './lit-2.js';

import type {ApiDocsConfig} from '../types.js';

const root = pathlib.resolve(__dirname, '..', '..', '..', '..', '..');
const dataDir = pathlib.join(root, 'packages', 'lit-dev-api', 'api-data');
const workDir = pathlib.join(dataDir, 'lit-3');
const gitDir = pathlib.join(workDir, 'repo');
const litDir = pathlib.join(gitDir, 'packages', 'lit');
const srcDir = pathlib.join(litDir, 'src');

/**
 * lit.dev API docs configuration for Lit 3.x
 */
export const lit3Config: ApiDocsConfig = {
  ...lit2Config,
  commit: 'd04a3e30eb3ae3520fb0ac163fb5ddbbf6030620',
  workDir,
  gitDir,
  tsConfigPath: pathlib.join(litDir, 'tsconfig.json'),
  pagesOutPath: pathlib.resolve(workDir, 'pages.json'),
  symbolsOutPath: pathlib.resolve(workDir, 'symbols.json'),
  typedocRoot: pathlib.join(root, 'packages'),

  entrypointModules: [
    pathlib.join(srcDir, 'async-directive.ts'),
    pathlib.join(srcDir, 'decorators.ts'),
    pathlib.join(srcDir, 'directives/'), // Entire directory
    pathlib.join(srcDir, 'directive.ts'),
    pathlib.join(srcDir, 'directive-helpers.ts'),
    pathlib.join(srcDir, 'index.ts'),
    // Don't include polyfill-support.ts because it doesn't export anything.
    //   pathlib.join(srcDir, 'polyfill-support.ts'),
    pathlib.join(srcDir, 'static-html.ts'),
  ],

  pages: [
    {
      slug: 'LitElement',
      title: 'LitElement',
      versionLinks: {
        v1: 'api/lit-element/LitElement/',
      },
    },
    {
      slug: 'ReactiveElement',
      title: 'ReactiveElement',
      versionLinks: {
        v1: 'api/lit-element/UpdatingElement/',
      },
    },
    {
      slug: 'templates',
      title: 'Templates',
      versionLinks: {
        v1: 'api/lit-html/templates/',
      },
    },
    {
      slug: 'styles',
      title: 'Styles',
      versionLinks: {
        v1: 'api/lit-element/styles/',
      },
    },
    {
      slug: 'decorators',
      title: 'Decorators',
      versionLinks: {
        v1: 'api/lit-element/decorators/',
      },
    },
    {
      slug: 'directives',
      title: 'Directives',
      tocFilter: (node) => node.kind === ReflectionKind.Function,
      versionLinks: {
        v1: 'api/lit-html/directives/',
      },
    },
    {
      slug: 'custom-directives',
      title: 'Custom directives',
      versionLinks: {
        v1: 'api/lit-html/custom-directives/',
      },
    },
    {
      slug: 'static-html',
      title: 'Static HTML',
      versionLinks: {
        v1: 'api/lit-html/templates/',
      },
    },
    {
      slug: 'controllers',
      title: 'Controllers',
      versionLinks: {
        v1: 'api/lit-element/LitElement/',
      },
    },
    {
      slug: 'misc',
      title: 'Misc',
      versionLinks: {
        v1: 'api/lit-element/LitElement/',
      },
    },
  ],

  locationToUrl({page, anchor}) {
    return `/docs/v3/api/${page}/#${anchor}`;
  },
};
