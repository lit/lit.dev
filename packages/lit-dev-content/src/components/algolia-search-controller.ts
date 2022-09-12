/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {Task, TaskStatus} from '@lit-labs/task';
import type {Hit} from '@algolia/client-search';
export type {Hit} from '@algolia/client-search';
import algoliasearch, {
  SearchClient,
  SearchIndex,
} from 'algoliasearch/dist/algoliasearch-lite.esm.browser.js';
import {ReactiveControllerHost} from 'lit';
import {publicVars} from 'lit-dev-tools-esm/lib/configs.js';

const agloliaSearchControllerDefaultOptions = {
  appId: publicVars.algolia.appId,
  searchOnlyKey: publicVars.algolia.searchOnlyKey,
  index: publicVars.algolia.index,
  attributesToHighlight: undefined as string[] | undefined,
  attributesToRetrieve: undefined as string[] | undefined,
};

type Writeable<T extends {[x: string]: any}, K extends string | number> = {
  [P in K]: T[P];
};

export type AlgoliaSearchControllerOptions =
  typeof agloliaSearchControllerDefaultOptions;

export class AgloliaSearchController<T extends {}> {
  private _task;
  private _client: SearchClient;
  private _index: SearchIndex;
  private _lastValue: Hit<T>[] = [];
  // https://www.algolia.com/doc/api-reference/api-parameters/attributesToHighlight/#the-response-object
  private _attributesToHighlight: string[] | undefined;
  // https://www.algolia.com/doc/api-reference/api-parameters/attributesToRetrieve/
  private _attributesToRetrieve: string[] | undefined;

  public get value() {
    if (this._task.status !== TaskStatus.COMPLETE) {
      return this._lastValue;
    }

    this._lastValue = this._task.value!;
    return this._task.value!;
  }

  constructor(
    host: ReactiveControllerHost,
    argsFn: () => string,
    options?: Partial<AlgoliaSearchControllerOptions>
  ) {
    const opts = {...agloliaSearchControllerDefaultOptions, ...options};
    this._client = algoliasearch(opts.appId, opts.searchOnlyKey);
    this._index = this._client.initIndex(opts.index);
    this._attributesToHighlight = opts.attributesToHighlight;
    this._attributesToRetrieve = opts.attributesToRetrieve;
    this._task = new Task(
      host,
      ([text]) => this._querySearch(text),
      () => [argsFn()]
    );
  }

  /**
   * Populate suggestion dropdown from query.
   *
   * An empty query clears suggestions.
   */
  private async _querySearch(query: string): Promise<Hit<T>[]> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return [];
    }
    type SearchOptionsReadonly = NonNullable<
      Parameters<typeof this._index.search>[1]
    >;
    type SearchOptions = Writeable<
      SearchOptionsReadonly,
      keyof SearchOptionsReadonly
    >;
    const searchOpts: SearchOptions = {
      page: 0,
      hitsPerPage: 10,
    };

    if (this._attributesToHighlight) {
      searchOpts.attributesToHighlight = this._attributesToHighlight;
    }

    if (this._attributesToRetrieve) {
      searchOpts.attributesToRetrieve = this._attributesToRetrieve;
    }

    const results = await this._index.search<T>(trimmedQuery, searchOpts);
    console.log(results);
    return results.hits;
  }
}
