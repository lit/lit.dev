/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {linkifySymbolsInCommentsBuilder} from './transformer.js';

const symbolMap = {
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

const locationToUrl = ({page, anchor}: {page: string; anchor: string}) =>
  `${page}#${anchor}`;

/**
 * Simple replacer where comment node doesn't add any additional context.
 */
const simpleReplacer = linkifySymbolsInCommentsBuilder({
  node: {},
  symbolMap,
  locationToUrl,
});

type TestLabel = string;
type Input = string;
type Expected = string;

/**
 * Simple comment transformation tests, that don't use any node context.
 */
const simpleTests: Array<[TestLabel, Input, Expected]> = [
  [
    'simple [[`symbol`]] hyperlink',
    '[[`LitElement`]]',
    '[`LitElement`](LitElement#LitElement)',
  ],
  ['simple @link', '{@link LitElement}', '[LitElement](LitElement#LitElement)'],
  [
    'labeled @link',
    '{@link LitElement symbol}',
    '[symbol](LitElement#LitElement)',
  ],
  [
    'simple @linkcode',
    '{@linkcode LitElement}',
    '[`LitElement`](LitElement#LitElement)',
  ],
  [
    'labeled @linkcode',
    '{@linkcode LitElement label with spaces}',
    '[`label with spaces`](LitElement#LitElement)',
  ],
  [
    'labeled @linkcode handles backticks',
    '{@linkcode LitElement `backticks`}',
    '[`backticks`](LitElement#LitElement)',
  ],
  [
    'labeled @link handles backticks',
    '{@link LitElement has `some` backticks}',
    '[has `some` backticks](LitElement#LitElement)',
  ],
  [
    'simple [[`symbol` | label]] hyperlink',
    '[[`LitElement`| custom label]] reference',
    '[`custom label`](LitElement#LitElement) reference',
  ],
  [
    'multiple replacements',
    '[[`LitElement`]] {@linkcode LitElement.attributeChangedCallback}',
    '[`LitElement`](LitElement#LitElement) [`LitElement.attributeChangedCallback`](LitElement#LitElement.attributeChangedCallback)',
  ],
];

simpleTests.forEach(([label, input, expected]: [TestLabel, Input, Expected]) =>
  test(label, () => assert.equal(simpleReplacer(input), expected))
);

test('[[`symbol`]] hyperlink with node context', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {
      location: {
        anchor: 'LitElement',
      },
    },
    symbolMap,
    locationToUrl,
  });

  assert.equal(
    r('[[`attributeChangedCallback`]]'),
    '[`attributeChangedCallback`](LitElement#LitElement.attributeChangedCallback)'
  );
});

test('@linkcode hyperlink with node context', () => {
  const r = linkifySymbolsInCommentsBuilder({
    node: {
      location: {
        anchor: 'LitElement',
      },
    },
    symbolMap,
    locationToUrl,
  });

  assert.equal(
    r('{@linkcode attributeChangedCallback}'),
    '[`attributeChangedCallback`](LitElement#LitElement.attributeChangedCallback)'
  );
});

test.run();
