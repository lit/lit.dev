/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathlib from 'path';

import type {ApiDocsConfig} from '../types.js';

const root = pathlib.resolve(__dirname, '..', '..', '..', '..', '..');
const workDir = pathlib.join(root, 'packages', 'lit-dev-api');
const gitDir = pathlib.join(workDir, 'lit');
const litDir = pathlib.join(gitDir, 'packages', 'lit');
const srcDir = pathlib.join(litDir, 'src');
const outDir = pathlib.join(workDir, 'api-data');

/**
 * lit.dev API docs configuration for Lit 2.x
 */
export const lit2Config: ApiDocsConfig = {
  repo: 'https://github.com/lit/lit',
  commit: 'f8ee010bc515e4bb319e98408d38ef3d971cc08b',
  gitDir,
  tsConfigPath: pathlib.join(litDir, 'tsconfig.json'),
  pagesOutPath: pathlib.resolve(outDir, 'pages.json'),
  symbolsOutPath: pathlib.resolve(outDir, 'symbols.json'),
  typedocRoot: pathlib.join(root, 'packages'),

  extraSetupCommands: [
    {cmd: 'npm', args: ['run', 'bootstrap']},
    {
      cmd: 'npx',
      args: [
        'lerna',
        'run',
        'build:ts',
        '--scope',
        'lit',
        '--include-dependencies',
      ],
    },
  ],

  entrypointModules: [
    pathlib.join(srcDir, 'async-directive.ts'),
    pathlib.join(srcDir, 'decorators.ts'),
    pathlib.join(srcDir, 'directives/'), // Entire directory
    pathlib.join(srcDir, 'directive.ts'),
    pathlib.join(srcDir, 'directive-helpers.ts'),
    // Don't include html.ts because it is already re-exported by index.ts.
    //   pathlib.join(srcDir, 'html.ts'),
    // Don't include hydration because it's not ready yet.
    //   pathlib.join(srcDir, 'hydrate.ts'),
    //   pathlib.join(srcDir, 'hydrate-support.ts'),
    pathlib.join(srcDir, 'index.ts'),
    // Don't include polyfill-support.ts because it doesn't export anything.
    //   pathlib.join(srcDir, 'polyfill-support.ts'),
    pathlib.join(srcDir, 'static-html.ts'),
  ],

  symbolOrder: ['LitElement', 'ReactiveElement'],

  pages: [
    {
      slug: 'LitElement',
      title: 'LitElement',
    },
    {
      slug: 'ReactiveElement',
      title: 'ReactiveElement',
    },
    {
      slug: 'templates',
      title: 'Templates',
    },
    {
      slug: 'styles',
      title: 'Styles',
    },
    {
      slug: 'decorators',
      title: 'Decorators',
    },
    {
      slug: 'directives',
      title: 'Directives',
      anchorFilter: (node) => node.kindString === 'Function',
    },
    {
      slug: 'custom-directives',
      title: 'Custom directives',
    },
    {
      slug: 'static-html',
      title: 'Static HTML',
    },
    {
      slug: 'controllers',
      title: 'Controllers',
    },
    {
      slug: 'misc',
      title: 'Misc',
    },
  ],

  pageForSymbol(node): string {
    const entrypoint = node.entrypointSources?.[0]?.fileName ?? '';
    if (entrypoint.includes('/directives/')) {
      return 'directives';
    }

    if (entrypoint.endsWith('/decorators.ts')) {
      return 'decorators';
    }

    if (
      entrypoint.endsWith('/directive.ts') ||
      entrypoint.endsWith('/directive-helpers.ts') ||
      entrypoint.endsWith('/async-directive.ts') ||
      node.name === 'noChange' ||
      node.name === 'Part' ||
      node.name === 'AttributePart' ||
      node.name === 'BooleanAttributePart' ||
      node.name === 'ChildPart' ||
      node.name === 'ElementPart' ||
      node.name === 'EventPart' ||
      node.name === 'PropertyPart'
    ) {
      return 'custom-directives';
    }

    if (entrypoint.endsWith('/static-html.ts')) {
      return 'static-html';
    }

    if (node.name === 'LitElement' || node.name === 'RenderOptions') {
      return 'LitElement';
    }

    if (
      node.name === 'ReactiveElement' ||
      node.name === 'PropertyDeclaration' ||
      node.name === 'PropertyDeclarations' ||
      node.name === 'UpdatingElement' ||
      node.name === 'PropertyValues' ||
      node.name === 'ComplexAttributeConverter'
    ) {
      return 'ReactiveElement';
    }

    if (
      node.name === 'html' ||
      node.name === 'svg' ||
      node.name === 'render' ||
      node.name === 'nothing' ||
      node.name === 'SanitizerFactory' ||
      node.name === 'Template' ||
      node.name === 'TemplateResult' ||
      node.name === 'SVGTemplateResult'
    ) {
      return 'templates';
    }

    if (
      node.name === 'css' ||
      node.name === 'adoptStyles' ||
      node.name === 'getCompatibleStyle' ||
      node.name === 'unsafeCSS' ||
      node.name === 'supportsAdoptingStyleSheets' ||
      node.name.startsWith('CSS')
    ) {
      return 'styles';
    }

    if (
      node.name === 'ReactiveController' ||
      node.name === 'ReactiveControllerHost'
    ) {
      return 'controllers';
    }

    // TODO(aomarks) Make sure everything has a good final location, and then
    // throw if we get here.
    return 'misc';
  },

  locationToUrl({page, anchor}) {
    return `/docs/api/${page}/#${anchor}`;
  },

  fileToImportSpecifier(filename) {
    const match = filename.match(/^packages\/(.+?)\/src\/(.+)\.ts$/);
    if (!match) {
      return '';
    }
    // TODO(aomarks) This pkg is only our local directory name, which isn't
    // necessarily our NPM package name (e.g. it's @lit/reactive-element, not
    // reactive-element). Right now all our exports are from 'lit', so this is
    // fine in practice, but when we add e.g. @lit/localize we'll need to be
    // smarter here.
    let [_, pkg, pathMinusExtension] = match;
    // TODO(aomarks) This wrongly assumes index.ts is always the package main.
    return pathMinusExtension === 'index'
      ? pkg
      : `${pkg}/${pathMinusExtension}.js`;
  },
};
