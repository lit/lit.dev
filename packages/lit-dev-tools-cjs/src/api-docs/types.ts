/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type * as typedoc from 'typedoc';

export type DeclarationReflection = typedoc.JSONOutput.DeclarationReflection;

export interface ExtendedDeclarationReflection extends DeclarationReflection {
  location?: Location;
  externalLocation?: ExternalLocation;
  entrypointSources?: Array<ExtendedSourceReference>;
  heritage?: Array<{name: string; location?: Location}>;
  expandedCategories?: Array<{
    title: string;
    anchor: string;
    children: Array<DeclarationReflection>;
  }>;
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
}

/** A link to e.g. MDN. */
export interface ExternalLocation {
  url: string;
}
