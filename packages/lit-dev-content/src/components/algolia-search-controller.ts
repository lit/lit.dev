/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {Task, TaskStatus} from '@lit-labs/task';
import type {Hit} from '@algolia/client-search';
export type {Hit} from '@algolia/client-search';
import type {LiteClient} from 'algoliasearch/lite';
import {ReactiveControllerHost} from 'lit';
import {publicVars} from 'lit-dev-tools-esm/lib/configs.js';
import aa from 'search-insights';
import {liteClient} from 'algoliasearch/lite';

const agloliaSearchControllerDefaultOptions = {
  appId: publicVars.algolia.appId,
  searchOnlyKey: publicVars.algolia.searchOnlyKey,
  index: publicVars.algolia.index,
  hitsPerPage: 10,
  distinct: 4 as number | boolean,
  attributesToHighlight: ['*'],
  attributesToRetrieve: ['*'],
  attributesToSnippet: [] as string[],
};

type SearchOptions = Parameters<LiteClient['searchForHits']>[0] extends infer U
  ? U extends {requests: (infer V)[]}
    ? V extends {facet?: never}
      ? V
      : never
    : never
  : never;

export type AlgoliaSearchControllerOptions =
  typeof agloliaSearchControllerDefaultOptions;

export class AgloliaSearchController<T extends {}> {
  private _task;
  private _indexName: string;
  private _client: LiteClient;
  private _hitsPerPage: number;
  private _distinct: number | boolean;
  private _lastValue: Hit<T>[] = [];
  // https://www.algolia.com/doc/api-reference/api-parameters/attributesToHighlight/
  private _attributesToHighlight: string[];
  // https://www.algolia.com/doc/api-reference/api-parameters/attributesToRetrieve/
  private _attributesToRetrieve: string[];
  // https://www.algolia.com/doc/api-reference/api-parameters/attributesToSnippet/
  private _attributesToSnippet: string[];
  private _queryId = '';

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
    options?: Partial<AlgoliaSearchControllerOptions>,
  ) {
    const opts = {...agloliaSearchControllerDefaultOptions, ...options};
    this._indexName = opts.index;
    this._client = liteClient(opts.appId, opts.searchOnlyKey);
    this._hitsPerPage = opts.hitsPerPage;
    this._distinct = opts.distinct;
    this._attributesToHighlight = opts.attributesToHighlight;
    this._attributesToSnippet = opts.attributesToSnippet;
    this._attributesToRetrieve = opts.attributesToRetrieve;
    this._task = new Task(
      host,
      ([text]) => this._querySearch(text),
      () => [argsFn()],
    );

    aa('init', {
      appId: opts.appId,
      apiKey: opts.searchOnlyKey,
    });
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
    const request: SearchOptions = {
      query: trimmedQuery,
      indexName: this._indexName,
      page: 0,
      hitsPerPage: this._hitsPerPage,
      distinct: this._distinct,
      attributesToHighlight: this._attributesToHighlight,
      attributesToRetrieve: this._attributesToRetrieve,
      attributesToSnippet: this._attributesToSnippet,
      clickAnalytics: true,
    };

    const response = await this._client.searchForHits<T>({
      requests: [request],
    });

    if (!response.results.length) {
      this._queryId = '';

      return [];
    }

    const results = response.results[0];
    this._queryId = results.queryID!;

    return results.hits.map((hitRaw, i) => {
      const hit = hitRaw as Hit<T> & {position: number};
      hit.position = i + 1;
      return hit;
    });
  }

  /**
   * Call this method when a user clicks on a search result to send a click
   * event to Algolia.
   *
   * @param id The objectID of the clicked object.
   * @param position The position of the clicked object in the the search results. (1 indexed)
   */
  objectClicked(id: string, position: number) {
    if (!this._queryId) {
      return;
    }

    aa('clickedObjectIDsAfterSearch', {
      eventName: 'Search Modal Selection',
      queryID: this._queryId,
      index: this._indexName,
      objectIDs: [id],
      positions: [position],
    });
  }
}
