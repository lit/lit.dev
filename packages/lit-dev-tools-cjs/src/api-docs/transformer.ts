/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as typedoc from 'typedoc';
import * as fs from 'fs/promises';
import * as pathlib from 'path';
import * as sourceMap from 'source-map';
import {
  ApiDocsConfig,
  DeclarationReflection,
  ExtendedDeclarationReflection,
  SourceReference,
  ExtendedSourceReference,
  Location,
  ExternalLocation,
} from './types.js';

const findIndexOrInfinity = <T>(
  array: ReadonlyArray<T>,
  match: (el: T) => boolean
) => {
  const idx = array.findIndex(match);
  return idx === -1 ? Infinity : idx;
};

const isType = (node: DeclarationReflection) => {
  return node.kindString === 'Type alias' || node.kindString === 'Interface';
};

/**
 * Mapping from symbol name to an external URL.
 */
const symbolToExternalLink = new Map([
  [
    'CSSStyleSheet',
    'https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet',
  ],
  [
    'DocumentFragment',
    'https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment',
  ],
  ['Element', 'https://developer.mozilla.org/en-US/docs/Web/API/Element'],
  [
    'HTMLElement',
    'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement',
  ],
  [
    'HTMLTemplateElement',
    'https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement',
  ],
  ['ShadowRoot', 'https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot'],
  [
    'ShadowRootInit',
    'https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#parameters',
  ],
]);

/**
 * Data consumed by lit.dev API docs Eleventy template. Each item is a separate
 * page.
 */
type Pages = Array<{
  slug: string;
  title: string;
  items: Array<DeclarationReflection>;
}>;

/**
 * Map from $symbol to the location it appears in our docs. If there is more
 * than one item, then the symbol is ambiguous.
 */
type SymbolMap = {
  [symbol: string]: Array<Location>;
};

/**
 * Transform a TypeDoc JSON project for consumption by the lit.dev API docs
 * Eleventy template, and generate a symbol map that can be used to locate an
 * API within our custom page structure.
 */
export class ApiDocsTransformer {
  private config: ApiDocsConfig;
  private project: typedoc.JSONOutput.ProjectReflection;
  private symbolMap: SymbolMap = {};
  /** Map from every numeric TypeDoc ID to its TypeDoc reflection object. */
  private reflectionById = new Map<number, ExtendedDeclarationReflection>();
  /** Cache of .d.ts -> .ts sourcemaps. */
  private sourceMaps = new Map<string, sourceMap.SourceMapConsumer>();

  constructor(
    project: typedoc.JSONOutput.ProjectReflection,
    config: ApiDocsConfig
  ) {
    this.project = project;
    this.config = config;
  }

  async transform(): Promise<{
    symbolMap: SymbolMap;
    pages: Pages;
  }> {
    // In the first pass, determine the page/anchor where each node should
    // appear in our layout, and index all nodes by TypeDoc numeric ID.
    for (const entrypoint of this.project.children ?? []) {
      const ancestry: DeclarationReflection[] = [];
      const firstPassVisit = async (node: DeclarationReflection) => {
        // We want to generate import statement module specifiers using our
        // chosen entrypoint module specifier, instead of module specifier for
        // the definition of this symbol (e.g. we want "lit" instead of
        // "lit-element/lit-element.js"). But since we're going to re-arrange
        // items out of their original entrypoint module organization, we need
        // to copy our original entrypoint source info to each node.
        (node as ExtendedDeclarationReflection).entrypointSources =
          entrypoint.sources;
        for (const source of node.sources ?? []) {
          this.makeSourceRelativeToMonorepoRoot(source);
          await this.updateSourceFromDtsToTs(source);
          this.setImportModuleSpecifier(source);
        }
        this.choosePageLocation(node, ancestry);
        this.promoteVariableFunctions(node);
        this.promoteAccessorTypes(node);
        this.promoteSignatureComments(node);
        this.reflectionById.set(node.id, node);
        node.children = (node.children ?? []).filter((child) =>
          this.filter(child)
        );
        ancestry.push(node);
        for (const child of node.children) {
          await firstPassVisit(child);
        }
        ancestry.pop();
      };
      await firstPassVisit(entrypoint);
    }

    // It's possible for the same exact export to be duplicated by TypeDoc. This
    // can happen if:
    //
    // 1. Two entrypoints export the same symbol
    // 2. A TypeScript value and type are exported as separate statements
    const exportKeyToIds = new Map<string, Array<number>>();
    const duplicateExportIdsToRemove = new Set<number>();
    for (const entrypoint of this.project.children ?? []) {
      for (const node of entrypoint.children ?? []) {
        const source = node.sources?.[0];
        if (!source) {
          continue;
        }
        const exportKey = source.fileName + '#' + node.name;
        let ids = exportKeyToIds.get(exportKey);
        if (ids === undefined) {
          ids = [];
          exportKeyToIds.set(exportKey, ids);
        }
        ids.push(node.id);
      }
    }
    for (const ids of exportKeyToIds.values()) {
      if (ids.length <= 1) {
        // No conflicts.
        continue;
      }
      ids.sort((a, b) => {
        const aReflection = this.reflectionById.get(a);
        const bReflection = this.reflectionById.get(b);
        // Prefer a shorter import statement.
        const aImportLength =
          aReflection?.entrypointSources?.[0]?.moduleSpecifier?.length ??
          Infinity;
        const bImportLength =
          bReflection?.entrypointSources?.[0]?.moduleSpecifier?.length ??
          Infinity;
        if (aImportLength !== bImportLength) {
          return aImportLength - bImportLength;
        }
        // Prefer a value to a type.
        const aTypeAlias = aReflection?.kindString === 'Type alias';
        const bTypeAlias = bReflection?.kindString === 'Type alias';
        if (!aTypeAlias && bTypeAlias) {
          return -1;
        }
        if (aTypeAlias && !bTypeAlias) {
          return 1;
        }
        // Arbitrary but deterministic.
        return a - b;
      });
      const winnerReflection = this.reflectionById.get(ids[0]);
      if (!winnerReflection) {
        continue;
      }
      for (const loserId of ids.slice(1)) {
        duplicateExportIdsToRemove.add(loserId);
        // Also update the id -> reflection map, so that any cross-references we
        // add will point at the winner location.
        this.reflectionById.set(loserId, winnerReflection);
      }
    }

    // In the second pass, we now know the location of every node, so we can
    // generate cross-references.
    const secondPassVisit = (node: DeclarationReflection) => {
      this.expandTransitiveHeritage(node);
      this.addLocationsForAllIds(node);
      this.expandAndMergeCategoryReferences(node);
      this.linkifySymbolsInComments(node);
      node.children = (node.children ?? []).filter(
        (child) => !duplicateExportIdsToRemove.has(child.id)
      );
      for (const child of node.children) {
        secondPassVisit(child);
      }
    };
    secondPassVisit(this.project);

    const pages = this.reorganizeExportsIntoPages();
    this.prunePageData(pages);

    return {
      symbolMap: this.symbolMap,
      pages,
    };
  }

  /**
   * Remove nodes that we don't care about documenting.
   */
  private filter(node: DeclarationReflection) {
    return !(
      node.flags?.isPrivate ||
      node.flags?.isExternal ||
      node.name.startsWith('_') ||
      // Reference types don't seem useful; just aliases for other nodes.
      node.kindString === 'Reference'
    );
  }

  /**
   * Pick a page and anchor, and assign it to the location property.
   */
  private choosePageLocation(
    node: DeclarationReflection,
    ancestry: Array<DeclarationReflection>
  ) {
    if (!node.kindString || node.kindString === 'Module') {
      return;
    }

    let nearestAncestorLocation;
    for (let i = ancestry.length - 1; i >= 0; i--) {
      const ancestor = ancestry[i] as ExtendedDeclarationReflection;
      if (ancestor.location) {
        nearestAncestorLocation = ancestor.location;
        break;
      }
    }

    const page = nearestAncestorLocation
      ? nearestAncestorLocation.page
      : this.config.pageForSymbol(node);

    const anchor = nearestAncestorLocation
      ? nearestAncestorLocation.anchor + '.' + node.name
      : node.name;

    if (page && anchor) {
      const location = {page, anchor};
      (node as ExtendedDeclarationReflection).location = location;
      this.updateSymbolMap(node.name, location);
      if (location.anchor !== node.name) {
        this.updateSymbolMap(location.anchor, location);
      }
    }
  }

  /**
   * Add a symbol to the symbol map.
   */
  private updateSymbolMap(symbol: string, location: Location) {
    // Prepend with $ so that we don't collide with builtins. We aren't using a
    // Map because we need to serialize to JSON.
    symbol = '$' + symbol;
    let arr = this.symbolMap[symbol];
    if (arr === undefined) {
      arr = [];
      this.symbolMap[symbol] = arr;
    }
    arr.push(location);
  }

  /**
   * When a function is defined like `const fn = () => { ... }` instead of with
   * the `function` keyword, TypeDoc buries things like parameters more deeply
   * inside the JSON structure. Hoist up this data so that we can treat
   * functions uniformly regardless of how they are defined.
   */
  private promoteVariableFunctions(node: DeclarationReflection) {
    if (node.kindString !== 'Variable') {
      return;
    }
    const signatures = (node.type as {declaration?: DeclarationReflection})
      ?.declaration?.signatures;
    if (!signatures) {
      return;
    }
    node.kindString = 'Function';
    node.signatures = signatures;
    for (const sig of node.signatures ?? []) {
      sig.name = node.name;
    }
  }

  /**
   * TypeDoc nests type information for getters/setters. Promote them so that
   * they can be treated more uniformly with properties.
   */
  private promoteAccessorTypes(node: DeclarationReflection) {
    if (node.kindString !== 'Accessor') {
      return;
    }
    if (node.getSignature?.[0]) {
      node.type = node.getSignature[0].type;
    }
  }

  /**
   * For functions, TypeDoc put comments inside the signatures property, instead
   * of directly in the function node. Hoist these comments up so that we can
   * treat comments uniformly.
   */
  private promoteSignatureComments(node: DeclarationReflection) {
    if (!node.comment?.shortText && node.signatures?.[0]?.comment?.shortText) {
      node.comment = node.signatures[0].comment;
    }
  }

  /**
   * Adds a "heritage" property that's similar to the existing "extendedTypes"
   * property, but adds transitive heritage (e.g. adds HTMLElement to
   * [LitElement -> ReactiveElement -> HTMLElement]), and adds page/anchor
   * locators.
   */
  private expandTransitiveHeritage(node: DeclarationReflection) {
    if (!node.extendedTypes) {
      // Has no heritage.
      return [];
    }
    let heritage = (node as ExtendedDeclarationReflection).heritage;
    if (heritage) {
      // Already computed this heritage.
      return heritage;
    }
    heritage = [];
    (node as ExtendedDeclarationReflection).heritage = heritage;
    for (const extendee of node.extendedTypes as Array<{
      name: string;
      id?: number;
    }>) {
      heritage.push(extendee);
      if (extendee.id !== undefined) {
        const extendeeNode = this.reflectionById.get(extendee.id);
        if (extendeeNode !== undefined) {
          heritage.push(...this.expandTransitiveHeritage(extendeeNode));
        }
      }
    }
    return heritage;
  }

  /**
   * Add `location: {page, anchor}` properties to every object that looks like
   * its a reference to another TypeDoc symbol. Handles nested objects and
   * arrays.
   *
   * There are lots of places where a reference like this can appear, so we just
   * use the heuristic that if any object has a numeric "id" property, and
   * TypeDoc has a reflection with that id, then we should give it a location.
   */
  private addLocationsForAllIds(node: unknown, isTopLevel = true) {
    if (typeof node !== 'object' || node === null) {
      return;
    }
    if (node instanceof Array) {
      for (const item of node) {
        this.addLocationsForAllIds(item, false);
      }
      return;
    }
    for (const [key, val] of Object.entries(node)) {
      if (key === 'id' && typeof val === 'number' && !('location' in node)) {
        const reflection = this.reflectionById.get(val);
        if (reflection && reflection.location) {
          (node as {location?: Location}).location = reflection.location;
        }
      } else if (
        key === 'name' &&
        typeof val === 'string' &&
        symbolToExternalLink.has(val)
      ) {
        (node as {externalLocation?: ExternalLocation}).externalLocation = {
          url: symbolToExternalLink.get(val)!,
        };
      } else if (!(isTopLevel && key === 'children')) {
        // We already recurse into children of top-level reflections in our main
        // traversal, no need to also do it here.
        this.addLocationsForAllIds(val, false);
      }
    }
  }

  /**
   * Remove fields that we don't need for rendering. This makes reading diffs
   * much easier, since we check the generated JSON file in.
   */
  private prunePageData(node: unknown) {
    if (node instanceof Array) {
      for (const item of node) {
        this.prunePageData(item);
      }
    } else if (typeof node === 'object' && node !== null) {
      // Method comments are duplicated both at the root of the node, and also
      // inside its signature. Remove the one from the signature.
      if (
        (node as ExtendedDeclarationReflection).comment &&
        (node as ExtendedDeclarationReflection).signatures?.[0]?.comment
      ) {
        delete (node as ExtendedDeclarationReflection).signatures?.[0]?.comment;
      }
      for (const [key, val] of Object.entries(node)) {
        // Prune the child first, so that our "empty arrays and objects" check
        // works more aggressively.
        this.prunePageData(val);
        if (
          // We instead use the "location" field which tells us the page/anchor,
          // instead of the internal numeric TypeDoc id. This id is
          // non-deterministic, so it creates meaningless churn!
          key === 'id' ||
          // We do use some "children" fields, but not the ones that are just
          // lists of numeric IDs.
          (key === 'children' &&
            val instanceof Array &&
            val.every((i) => typeof i === 'number')) ||
          // We only need the line number for GitHub URLs.
          key === 'character' ||
          // We render the readable "kindString" field instead of the numeric
          // "kind" field.
          key === 'kind' ||
          // If we've created an "expandedCategories" field, then we don't also
          // render the normal "children" field.
          (key === 'children' &&
            (node as ExtendedDeclarationReflection).expandedCategories) ||
          // We use "groups" to generate "expandedCategories", but don't render
          // it directly.
          key === 'groups' ||
          // Empty arrays and objects.
          (typeof val === 'object' &&
            val !== null &&
            Object.keys(val).length === 0) ||
          // We don't render JSDoc tags directly, the ones we care about are
          // already extracted into e.g. "parameters".
          key === 'tags'
        ) {
          delete node[key as keyof typeof node];
        }
      }
    }
  }

  /**
   * The "categories" lists are just numeric reflection ID references. They're
   * also divided across Property/Method/etc. groups. Create a flat list of
   * mixed types, and with fully expanded reflections.
   */
  private expandAndMergeCategoryReferences(
    node: ExtendedDeclarationReflection
  ) {
    for (const group of node.groups ?? []) {
      for (const category of group.categories ?? []) {
        const name = category.title;
        // Delimit with '/' instead of '.' so that a category anchor can never
        // overlap with a property/method anchor.
        const anchor = node.name + '/' + name;
        node.expandedCategories ??= [];
        let cat = node.expandedCategories.find(
          (category) => category.anchor === anchor
        );
        if (cat === undefined) {
          cat = {
            anchor,
            title: name
              .replace(/-/g, ' ')
              // Uppercase first letter
              .replace(/^./, (c) => c.toUpperCase()),
            children: [],
          };
          node.expandedCategories.push(cat);
        }
        for (const id of category.children ?? []) {
          const ref = this.reflectionById.get(id);
          if (ref !== undefined) {
            cat.children.push(ref);
          }
        }
      }
    }
    if (node.expandedCategories) {
      node.expandedCategories.sort(({title: a}, {title: b}) =>
        a.localeCompare(b)
      );
      for (const category of node.expandedCategories) {
        category.children.sort(this.symbolSortFn);
      }
    }
  }

  /**
   * Determines order of symbols within a page, and of properties/methods appear
   * within a class/interface.
   */
  symbolSortFn = (
    a: DeclarationReflection,
    b: DeclarationReflection
  ): number => {
    // By entrypoint (e.g. a type from a directive module should be adjacent to
    // the directive function).
    const aEntrypoint =
      (a as ExtendedDeclarationReflection).entrypointSources?.[0]?.fileName ??
      '';
    const bEntrypoint =
      (b as ExtendedDeclarationReflection).entrypointSources?.[0]?.fileName ??
      '';
    if (aEntrypoint !== bEntrypoint) {
      return aEntrypoint.localeCompare(bEntrypoint);
    }

    // Hard-coded orderings
    const idxA = findIndexOrInfinity(
      this.config.symbolOrder,
      (s) =>
        s === (a as ExtendedDeclarationReflection).location?.anchor ?? a.name
    );
    const idxB = findIndexOrInfinity(
      this.config.symbolOrder,
      (s) =>
        s === (b as ExtendedDeclarationReflection).location?.anchor ?? b.name
    );
    if (idxA !== idxB) {
      return idxA - idxB;
    }

    // Types after values
    if (isType(a) && !isType(b)) {
      return 1;
    }
    if (!isType(a) && isType(b)) {
      return -1;
    }

    // Lexicographic
    return a.name.localeCompare(b.name);
  };

  /**
   * Convert [[ symbol ]], `@link`, and `@linkcode` comments into hyperlinks.
   *
   * Suppports the following examples:
   *  * Example link to {@link ApiDocsTransformer} symbol.
   *  * Example monospace link to {@linkcode ApiDocsTransformer}.
   *  * {@link ApiDocsTransformer Example labeled link.}
   *  * {@linkcode ApiDocsTransformer Example monospace labeled link.}
   *
   * Also supports these deprecated examples which don't have IDE hyperlinks:
   *  * [[`ApiDocsTransformer`]]
   *  * [[`ApiDocsTransformer`| Example labeled link.]]
   *
   * TODO(aomarks) This should probably technically be factored out and called
   * directly from Eleventy, because the URL we generate depends on the
   * configured Eleventy base URL. In practice, we always mount lit.dev to / so
   * it doesn't matter.
   */
  private linkifySymbolsInComments(node: DeclarationReflection) {
    const replace = linkifySymbolsInCommentsBuilder({
      node: node as ExtendedDeclarationReflection,
      symbolMap: this.symbolMap,
      locationToUrl: this.config.locationToUrl.bind(this),
    });

    if (node.comment?.shortText) {
      node.comment.shortText = replace(node.comment.shortText);
    }
    if (node.comment?.text) {
      node.comment.text = replace(node.comment.text);
    }
  }

  /**
   * TypeDoc sources are reported relative to the lit.dev packages/ directory,
   * for some reason. Update them to be relative to the Lit monorepo root.
   */
  private async makeSourceRelativeToMonorepoRoot(source: SourceReference) {
    source.fileName = pathlib.relative(
      this.config.gitDir,
      pathlib.resolve(this.config.typedocRoot, source.fileName)
    );
  }

  /**
   * TypeDoc sources are ".d.ts" files, but we prefer the original ".ts" source
   * files. Follow the corresponding ".d.ts.map" source map to find the original
   * file and location.
   */
  private async updateSourceFromDtsToTs(source: SourceReference) {
    let consumer = this.sourceMaps.get(source.fileName);
    if (!consumer) {
      if (!source.fileName.endsWith('.d.ts')) {
        return;
      }
      const mapFilename = pathlib.join(
        this.config.gitDir,
        source.fileName + '.map'
      );
      let mapStr;
      try {
        mapStr = await fs.readFile(mapFilename, 'utf8');
      } catch (e) {
        if ((e as {code: string}).code == 'ENOENT') {
          return;
        }
        throw e;
      }
      consumer = await new sourceMap.SourceMapConsumer(mapStr);
      this.sourceMaps.set(source.fileName, consumer);
    }
    const pos = consumer.originalPositionFor({
      line: source.line,
      column: source.character,
    });
    if (!pos.source) {
      return;
    }

    // TODO(aomarks) The Lit monorepo d.ts.map files currently incorrectly have
    // a sources field like "../src/source.ts" because they are copied directly
    // out of the "development/" folder. We need to fix that properly the Lit
    // monorepo, but temporarily fix it here too.
    if (pos.source.startsWith('../')) {
      pos.source = pos.source.slice('../'.length);
    }
    source.fileName = pathlib.join(
      pathlib.dirname(source.fileName),
      pos.source
    );
    source.line = pos.line ?? 0;
    source.character = pos.column ?? 0;
  }

  /**
   * Augment a source with its best import statement module specifier.
   */
  private setImportModuleSpecifier(source: SourceReference) {
    const specifier = this.config.fileToImportSpecifier(source.fileName);
    if (specifier) {
      (source as ExtendedSourceReference).moduleSpecifier =
        this.config.fileToImportSpecifier(source.fileName);
    }
  }

  /**
   * Re-organize all module exports into our custom page structure.
   */
  private reorganizeExportsIntoPages() {
    const slugToPage = new Map<
      string,
      {
        slug: string;
        title: string;
        anchorFilter?: (node: DeclarationReflection) => boolean;
        items: Array<DeclarationReflection>;
        repo: string;
        commit: string;
      }
    >();

    for (const module of this.project.children ?? []) {
      for (const export_ of module.children ?? []) {
        const location = (export_ as ExtendedDeclarationReflection).location;
        if (!location) {
          continue;
        }
        let page = slugToPage.get(location.page);
        if (page === undefined) {
          const match = this.config.pages.find(
            ({slug}) => slug === location.page
          );
          if (!match) {
            throw new Error(`No page definition for ${location.page}`);
          }
          page = {
            ...match,
            repo: this.config.repo,
            commit: this.config.commit,
            items: [],
          };
          slugToPage.set(location.page, page);
        }
        page.items.push(export_);
      }
    }

    const pagesArray = [...slugToPage.values()];

    // Sort pages
    pagesArray.sort(({slug: a}, {slug: b}) => {
      const idxA = findIndexOrInfinity(
        this.config.pages,
        ({slug}) => slug === a
      );
      const idxB = findIndexOrInfinity(
        this.config.pages,
        ({slug}) => slug === b
      );
      if (idxA !== idxB) {
        return idxA - idxB;
      }
      return a.localeCompare(b);
    });

    // Sort items within pages
    for (const page of pagesArray) {
      page.items.sort(this.symbolSortFn);

      if (page.anchorFilter) {
        for (const item of page.items) {
          if (!page.anchorFilter(item)) {
            delete (item as ExtendedDeclarationReflection)['location'];
          }
        }
      }
    }

    return pagesArray;
  }
}

/**
 * Returns a string replacer function that converts jsdoc links into markdown
 * hyperlinks that are used in the generated API documentation.
 *
 * See {@linkcode ApiDocsTransformer.linkifySymbolsInComments} for more info.
 */
export function linkifySymbolsInCommentsBuilder({
  node,
  symbolMap,
  locationToUrl,
}: {
  node: {
    location?: {
      anchor?: string;
    };
  };
  symbolMap: SymbolMap;
  locationToUrl: (location: Location) => string;
}) {
  const replacer = (from: string, symbol: string, label: string): string => {
    const context =
      (node as ExtendedDeclarationReflection).location?.anchor?.split('.') ??
      [];
    let results;

    // If this node is "foo.bar", and we saw "[[ baz ]]", then look for a
    // match from closest to furthest:
    //
    // 1. $foo.bar.baz
    // 2. $foo.baz
    // 3. $baz
    for (let i = context.length; i >= 0; i--) {
      const key = '$' + [...context.slice(0, i), symbol].join('.');
      results = symbolMap[key];
      if (results) {
        break;
      }
    }

    const isCodeFenced = (anchorText: string) =>
      from.startsWith('{@linkcode') || from.startsWith('[[`')
        ? `\`${anchorText}\``
        : anchorText;

    if (results && results.length === 1) {
      return `[${isCodeFenced(label || symbol)}](${locationToUrl(results[0])})`;
    }
    return isCodeFenced(label || symbol);
  };

  return (comment: string) =>
    comment
      .replace(/\[\[[\s`]*(.+?)(?:[\s`]*\|[\s`]*(.+?))?[\s`]*\]\]/g, replacer)
      .replace(
        /\{\@(?:link\b|linkcode\b)[\s`]*(.+?)(?:[\s`]*[\|\s][\s`]*(.+?))?[\s`]*\}/g,
        replacer
      );
}
