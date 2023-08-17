/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type * as typedoc from 'typedoc';

/**
 * The data on each declaration node.
 */
export type DeclarationReflection = typedoc.JSONOutput.DeclarationReflection;

/**
 * The data on each comment node.
 *
 * To ease migration of TypeDoc, it currently contains some optional fields that
 * reflect properties in earlier versions of TypeDoc. `shortText` and `text` are
 * no longer emitted by TypeDoc, thus we manually create them. They are required
 * by our API html generation.
 */
export interface MigrationComment
  extends Omit<typedoc.JSONOutput.Comment, 'summary'> {
  shortText?: string;
  text?: string;
  summary?: typedoc.JSONOutput.CommentDisplayPart[];
}

export interface ExtendedDeclarationReflection extends DeclarationReflection {
  location?: Location;
  entrypointSources?: Array<ExtendedSourceReference>;
  heritage?: Array<{name: string; location?: Location}>;
  expandedCategories?: Array<{
    title: string;
    anchor: string;
    children: Array<DeclarationReflection>;
  }>;
  kindString?: string;
}

export type SourceReference = typedoc.JSONOutput.SourceReference;

export interface ExtendedSourceReference extends SourceReference {
  gitHubUrl?: string;
  moduleSpecifier?: string;
}

/** Where to find a symbol in our custom API docs page structure. */
export interface Location {
  page: string;
  anchor: string;
  /**
   * Prevents this Location from being referenced by the generated Table of
   * Contents by adding the "data-toc-exclude" attribute to the DOM node.
   * See https://github.com/JordanShurmer/eleventy-plugin-nesting-toc
   */
  excludeFromTOC?: boolean;
}

export interface ApiDocsConfig {
  /**
   * Git repo remote URL.
   */
  repo: string;

  /**
   * Git commit reference (SHA or tag).
   */
  commit: string;

  /**
   * Directory we can use for storing data about this repo.
   */
  workDir: string;

  /**
   * Location where Git repo will be cloned.
   */
  gitDir: string;

  /**
   * Path to the tsconfig.json that owns the entrypoint modules.
   */
  tsConfigPath: string;

  /**
   * The directory that TypeDoc chooses as the root of this package. Unclear why
   * this is unpredictable.
   */
  typedocRoot: string;

  /**
   * Extra setup/build commands to run after NPM install and before running
   * TypeDoc.
   */
  extraSetupCommands?: Array<{cmd: string; args: string[]}>;

  /**
   * Entrypoint TypeScript modules for TypeDoc to analyze.
   *
   * The modules listed here should be the preferred modules that users should
   * import from, because import statements will be generated using these
   * entrypoints as the module specifier (e.g. `import {LitElement} from
   * 'lit'`). GitHub source links will be generated pointing at the ultimate
   * location where the symbol is concretely defined (e.g.
   * `packages/lit-element/src/lit-element.ts`).
   *
   * If a directory, all .ts files within it are included.
   */
  entrypointModules: string[];

  /**
   * Where to write the API data that is consumed by our Eleventy template.
   */
  pagesOutPath: string;

  /**
   * Where to write the index from $symbol to location object.
   */
  symbolsOutPath: string;

  /**
   * Order that items in an API docs page will appear. Falls back to
   * lexicographic. (Note this doesn't distinguish between pages, but we don't
   * have any overlapping export names for now so it doesn't matter).
   */
  symbolOrder: string[];

  /**
   * Pages in the order they will appear in the navigation.
   */
  pages: Array<{
    slug: string;
    title: string;
    tocFilter?: (node: DeclarationReflection) => boolean;
    versionLinks?: {[version: string]: string};
  }>;

  /**
   * Determine which generated API docs page the given TypeDoc reflection object
   * belongs in.
   *
   * Note that only top-level exports of each entrypoint module are passed here
   * (i.e. the methods of a class always go on the same page as the class).
   */
  pageForSymbol(node: ExtendedDeclarationReflection): string;

  /**
   * Generate a relative URL for the given location.
   */
  locationToUrl({page, anchor}: Location): string;

  /**
   * Maps a git-repo relative filename to an import specifier.
   */
  fileToImportSpecifier(filename: string): string;
}
