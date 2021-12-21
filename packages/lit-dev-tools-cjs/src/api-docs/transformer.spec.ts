/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {linkifySymbolsInCommentsBuilder} from './transformer.js';

const symbolMapFixture1 = {
  $LitElement: [
    {
      page: 'LitElement',
      anchor: 'LitElement',
    },
  ],
  ['$LitElement.attributeChangedCallback']: [
    {
      page: 'LitElement',
      anchor: 'LitElement.attributeChangedCallback',
    },
  ],
};

test('simple [[`symbol`]] hyperlink', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {},
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('Simple [[`LitElement`]] symbol reference'),
    'Simple [`LitElement`](LitElement#LitElement) symbol reference'
  );
});

test('simple @link', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {},
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('Simple {@link LitElement} symbol reference'),
    'Simple [LitElement](LitElement#LitElement) symbol reference'
  );
});

test('labeled @link', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {},
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('Simple {@link LitElement symbol} reference'),
    'Simple [symbol](LitElement#LitElement) reference'
  );
});

test('simple @linkcode', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {},
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('Simple {@linkcode LitElement symbol} reference'),
    'Simple [`symbol`](LitElement#LitElement) reference'
  );
});

test('simple [[`symbol` | label]] hyperlink', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {},
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });
  assert.equal(
    r('[[`LitElement`| custom label]] reference'),
    '[`custom label`](LitElement#LitElement) reference'
  );
});

test('multiple replacements', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {},
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('[[`LitElement`]] {@linkcode LitElement.attributeChangedCallback}'),
    '[`LitElement`](LitElement#LitElement) [`LitElement.attributeChangedCallback`](LitElement#LitElement.attributeChangedCallback)'
  );
});

test('[[`symbol`]] hyperlink with node context', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {
      location: {
        anchor: 'LitElement',
      },
    },
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('[[`attributeChangedCallback`]]'),
    '[`attributeChangedCallback`](LitElement#LitElement.attributeChangedCallback)'
  );
});

test('@link hyperlink with node context', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {
      location: {
        anchor: 'LitElement',
      },
    },
    symbolMap: symbolMapFixture1,
    locationToUrl: ({page, anchor}) => `${page}#${anchor}`,
  });

  assert.equal(
    r('{@linkcode attributeChangedCallback}'),
    '[`attributeChangedCallback`](LitElement#LitElement.attributeChangedCallback)'
  );
});
