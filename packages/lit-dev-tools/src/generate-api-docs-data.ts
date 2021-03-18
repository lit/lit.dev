/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import * as typedoc from 'typedoc';
import * as fs from 'fs/promises';
import * as pathlib from 'path';
import * as sourceMap from 'source-map';

const litMonorepoPath = pathlib.resolve(
  __dirname,
  '..',
  '..',
  'lit-dev-api',
  'lit'
);

/**
 * Entrypoint TypeScript modules for TypeDoc to analyze.
 *
 * The modules listed here should be the preferred modules that users should
 * import from, because import statements will be generated using these
 * entrypoints as the module specifier (e.g. `import {LitElement} from 'lit'`).
 * GitHub source links will be generated pointing at the ultimate location where
 * the symbol is concretely defined (e.g.
 * `packages/lit-element/src/lit-element.ts`).
 *
 * If a directory, all .ts files within it are included.
 */
const entrypointModules = [
  pathlib.resolve(litMonorepoPath, 'packages', 'lit', 'src', 'index.ts'),
  pathlib.resolve(litMonorepoPath, 'packages', 'lit', 'src', 'decorators.ts'),
  pathlib.resolve(litMonorepoPath, 'packages', 'lit', 'src', 'directives'), // directory
];

/**
 * Path to the tsconfig.json that owns the entrypoint modules.
 */
const tsConfigPath = pathlib.resolve(
  litMonorepoPath,
  'packages',
  'lit',
  'tsconfig.json'
);

/**
 * Where to write the API data that is consumed by our Eleventy template.
 */
const pagesOutPath = pathlib.resolve(
  __dirname,
  '..',
  '..',
  'lit-dev-api',
  'api-data',
  'pages.json'
);

/**
 * Where to write the index from $symbol to location object.
 */
const symbolsOutPath = pathlib.resolve(
  __dirname,
  '..',
  '..',
  'lit-dev-api',
  'api-data',
  'symbols.json'
);

/**
 * Order that generated API docs pages will appear in the navigation.
 */
const pageOrder = [
  'core',
  'decorators',
  'directives',
  'controllers',
  'misc',
  'types',
] as const;

/**
 * Order that items in an API docs page will appear. Falls back to
 * lexicographic. (Note this doesn't distinguish between pages, but we don't
 * have any overlapping export names for now so it doesn't matter).
 */
const symbolOrder = [
  'LitElement',
  'ReactiveElement',
  'PropertyDeclaration',
  'html',
  'css',
  'svg',
  'render',
];

/**
 * Determine which generated API docs page the given TypeDoc reflection object
 * belongs in.
 *
 * Note that only top-level exports of each entrypoint module are passed here
 * (i.e. the methods of a class always go on the same page as the class).
 */
const pageForSymbol = (
  node: DeclarationReflection
): typeof pageOrder[number] => {
  if (
    node.name === 'LitElement' ||
    node.name === 'ReactiveElement' ||
    node.name === 'PropertyDeclaration' ||
    node.name === 'html' ||
    node.name === 'css' ||
    node.name === 'svg' ||
    node.name === 'render'
  ) {
    return 'core';
  }
  if (
    node.name === 'ReactiveController' ||
    node.name === 'ReactiveControllerHost'
  ) {
    return 'controllers';
  }
  if (node.kindString === 'Type alias' || node.kindString === 'Interface') {
    return 'types';
  }
  if (node.sources?.[0]?.fileName.includes('/directives/')) {
    return 'directives';
  }
  if (node.sources?.[0]?.fileName.includes('/decorators/')) {
    return 'decorators';
  }
  return 'misc';
};

/**
 * Generate a relative URL for the given location.
 */
const locationToUrl = ({page, anchor}: Location) =>
  `/guide/api/${page}/#${anchor}`;

type DeclarationReflection = typedoc.JSONOutput.DeclarationReflection;
interface ExtendedDeclarationReflection extends DeclarationReflection {
  location?: Location;
  entrypointSources?: DeclarationReflection['sources'];
  heritage?: Array<{name: string; location?: Location}>;
}

type SourceReference = typedoc.JSONOutput.SourceReference;
interface ExtendedSourceReference extends SourceReference {
  gitHubUrl?: string;
  moduleSpecifier?: string;
}

/** Where to find a symbol in our custom API docs page structure. */
interface Location {
  page: typeof pageOrder[number];
  anchor: string;
}

/**
 * Data consumed by lit.dev API docs Eleventy template. Each item is a separate
 * page.
 */
type Pages = Array<{
  name: string;
  children: Array<DeclarationReflection>;
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
class Transformer {
  private project: typedoc.JSONOutput.ProjectReflection;
  private symbolMap: SymbolMap = {};
  /** Map from every numeric TypeDoc ID to its TypeDoc reflection object. */
  private reflectionById = new Map<number, ExtendedDeclarationReflection>();
  /** Cache of .d.ts -> .ts sourcemaps. */
  private sourceMaps = new Map<string, sourceMap.SourceMapConsumer>();

  constructor(project: typedoc.JSONOutput.ProjectReflection) {
    this.project = project;
  }

  async transform(): Promise<{
    symbolMap: SymbolMap;
    pages: Pages;
  }> {
    // In the first pass, determine the page/anchor where each node should
    // appear in our layout, and index all nodes by TypeDoc numeric ID.
    for (const entrypoint of this.project.children ?? []) {
      const ancestry: DeclarationReflection[] = [];
      const firstPassVisit = (node: DeclarationReflection) => {
        this.choosePageLocation(node, ancestry);
        // We want to generate import statement module specifiers using our
        // chosen entrypoint module specifier, instead of module specifier for
        // the definition of this symbol (e.g. we want "lit" instead of
        // "lit-element/lit-element.js"). But since we're going to re-arrange
        // items out of their original entrypoint module organization, we need
        // to copy our original entrypoint source info to each node.
        (node as ExtendedDeclarationReflection).entrypointSources =
          entrypoint.sources;
        this.reflectionById.set(node.id, node);
        node.children = (node.children ?? []).filter((child) =>
          this.filter(child)
        );
        ancestry.push(node);
        for (const child of node.children ?? []) {
          firstPassVisit(child);
        }
        ancestry.pop();
      };
      firstPassVisit(entrypoint);
    }

    // In the second pass, we now know the location of every node, so we can
    // generate cross-references.
    const secondPassVisit = async (node: DeclarationReflection) => {
      this.promoteVariableFunctions(node);
      this.promoteSignatureComments(node);
      this.expandTransitiveHeritage(node);
      this.addLocationsForAllIds(node);
      this.linkifySymbolsInComments(node);
      for (const source of node.sources ?? []) {
        await this.updateSourceFromDtsToTs(source);
        this.setGithubUrl(source);
        this.setImportModuleSpecifier(source);
      }

      for (const child of node.children ?? []) {
        await secondPassVisit(child);
      }
    };
    await secondPassVisit(this.project);

    const pages = this.reorganizeExportsIntoPages();

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
      node.inheritedFrom ||
      node.overwrites ||
      node.name.startsWith('_')
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
      : pageForSymbol(node);

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
   * For functions, TypeDoc put comments inside the signatures property, instead
   * of directly in the function node. Hoist these comments up so that we can
   * treat comments uniformly
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
      } else if (!(isTopLevel && key === 'children')) {
        // We already recurse into children of top-level reflections in our main
        // traversal, no need to also do it here.
        this.addLocationsForAllIds(val, false);
      }
    }
  }

  /**
   * Convert [[ symbol ]] references in comments into hyperlinks.
   *
   * TODO(aomarks) This should probably technically be factored out and called
   * directly from Eleventy, because the URL we generate depends on the
   * configured Eleventy base URL. In practice, we always mount lit.dev to / so
   * it doesn't matter.
   */
  private linkifySymbolsInComments(node: DeclarationReflection) {
    const replace = (comment: string) =>
      // TODO(aomarks) Maybe we also/instead support @link syntax?
      comment.replace(
        /\[\[[\s`]*(.+?)(?:[\s`]*\|[\s`]*(.+?))?[\s`]*\]\]/g,
        (_: string, symbol: string, label: string): string => {
          const context =
            (node as ExtendedDeclarationReflection).location?.anchor?.split(
              '.'
            ) ?? [];
          let results;

          // If this node is "foo.bar", and we saw "[[ baz ]]", then look for a
          // match from closest to furthest:
          //
          // 1. $foo.bar.baz
          // 2. $foo.baz
          // 3. $baz
          for (let i = context.length; i >= 0; i--) {
            const key = '$' + [...context.slice(0, i), symbol].join('.');
            results = this.symbolMap[key];
            if (results) {
              break;
            }
          }
          if (results && results.length === 1) {
            return `[\`${label || symbol}\`](${locationToUrl(results[0])})`;
          }
          return '`' + (label || symbol) + '`';
        }
      );

    if (node.comment?.shortText) {
      node.comment.shortText = replace(node.comment.shortText);
    }
    if (node.comment?.text) {
      node.comment.text = replace(node.comment.text);
    }
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
      const mapFilename = pathlib.resolve(
        litMonorepoPath,
        source.fileName.replace(/^lit\//, '') + '.map'
      );
      let mapStr;
      try {
        mapStr = await fs.readFile(mapFilename, 'utf8');
      } catch (e) {
        if (e.code == 'ENOENT') {
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
    // TODO(aomarks) Compute correctly.
    source.fileName = pathlib.relative(
      'lit',
      pathlib.resolve(source.fileName, pos.source ?? '')
    );
    source.line = pos.line ?? 0;
    source.character = pos.column ?? 0;
  }

  /**
   * Augment a source with a GitHub URL.
   */
  private setGithubUrl(source: SourceReference) {
    (source as ExtendedSourceReference).gitHubUrl = `https://github.com/Polymer/lit-html/blob/lit-next/${source.fileName}#L${source.line}`;
  }

  /**
   * Augment a source with its best import statement module specifier.
   */
  private setImportModuleSpecifier(source: SourceReference) {
    const match = source.fileName.match(
      /^lit\/packages\/(.+?)\/src\/(.+)\.ts$/
    );
    if (!match) {
      return;
    }
    // TODO(aomarks) This pkg is only our local directory name, which isn't
    // necessarily our NPM package name (e.g. it's @lit/reactive-element, not
    // reactive-element). Right now all our exports are from 'lit', so this is
    // fine in practice, but when we add e.g. @lit/localize we'll need to be
    // smarter here.
    let [_, pkg, pathMinusExtension] = match;
    // TODO(aomarks) This wrongly assumes index.ts is always the package main.
    (source as ExtendedSourceReference).moduleSpecifier =
      pathMinusExtension === 'index' ? pkg : `${pkg}/${pathMinusExtension}.js`;
  }

  /**
   * Re-organize all module exports into our custom page structure.
   */
  private reorganizeExportsIntoPages() {
    const pageToItems = new Map<
      typeof pageOrder[number],
      Array<DeclarationReflection>
    >();

    for (const module of this.project.children ?? []) {
      for (const export_ of module.children ?? []) {
        const location = (export_ as ExtendedDeclarationReflection).location;
        if (!location) {
          continue;
        }
        let items = pageToItems.get(location.page);
        if (items === undefined) {
          items = [];
          pageToItems.set(location.page, items);
        }
        items.push(export_);
      }
    }

    const pagesArray = [...pageToItems.entries()].map(([name, children]) => ({
      name,
      children,
    }));

    const indexOfOrInfinity = <T extends string>(
      array: ReadonlyArray<T>,
      item: T
    ) => {
      const idx = array.indexOf(item);
      return idx === -1 ? Infinity : idx;
    };

    // Sort pages
    pagesArray.sort(({name: a}, {name: b}) => {
      const idxA = indexOfOrInfinity(pageOrder, a);
      const idxB = indexOfOrInfinity(pageOrder, b);
      if (idxA !== idxB) {
        return idxA - idxB;
      }
      return a.localeCompare(b);
    });

    // Sort symbols within pages
    for (const {children} of pagesArray) {
      children.sort(({name: a}, {name: b}) => {
        const idxA = indexOfOrInfinity(symbolOrder, a);
        const idxB = indexOfOrInfinity(symbolOrder, b);
        if (idxA !== idxB) {
          return idxA - idxB;
        }
        return a.localeCompare(b);
      });
    }

    return pagesArray;
  }
}

async function main() {
  const app = new typedoc.Application();
  app.options.addReader(new typedoc.TSConfigReader());
  app.bootstrap({
    tsconfig: tsConfigPath,
    entryPoints: entrypointModules,
  });
  const root = app.convert();
  if (!root) {
    throw new Error('TypeDoc.Application.convert() returned undefined');
  }

  const json = await app.serializer.projectToObject(root);
  const transformer = new Transformer(json);
  const {pages, symbolMap} = await transformer.transform();

  await fs.writeFile(pagesOutPath, JSON.stringify(pages, null, 2), 'utf8');
  console.log(`Wrote ${pagesOutPath}`);
  await fs.writeFile(
    symbolsOutPath,
    JSON.stringify(symbolMap, null, 2),
    'utf8'
  );
  console.log(`Wrote ${symbolsOutPath}`);
}

main();
