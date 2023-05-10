/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as pathlib from 'path';
import {ReflectionKind} from 'typedoc';

import type {ApiDocsConfig} from '../types.js';

const root = pathlib.resolve(__dirname, '..', '..', '..', '..', '..');
const dataDir = pathlib.join(root, 'packages', 'lit-dev-api', 'api-data');
const workDir = pathlib.join(dataDir, 'lit-2');
const gitDir = pathlib.join(workDir, 'repo');
const litDir = pathlib.join(gitDir, 'packages', 'lit');
const srcDir = pathlib.join(litDir, 'src');

/**
 * lit.dev API docs configuration for Lit 2.x
 */
export const lit2Config: ApiDocsConfig = {
  repo: 'lit/lit',
  commit: 'c134604f178e36444261d83eabe9e578c1ed90c4',
  workDir,
  gitDir,
  tsConfigPath: pathlib.join(litDir, 'tsconfig.json'),
  pagesOutPath: pathlib.resolve(workDir, 'pages.json'),
  symbolsOutPath: pathlib.resolve(workDir, 'symbols.json'),
  typedocRoot: pathlib.join(root, 'packages'),

  extraSetupCommands: [
    {
      cmd: 'npm',
      args: ['run', 'build:ts'],
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
    return `/docs/v2/api/${page}/#${anchor}`;
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
