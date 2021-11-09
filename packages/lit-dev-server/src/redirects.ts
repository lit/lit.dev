/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

export const pageRedirects = new Map([
  ['/slack-invite',                   'https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw'],
  ['/msg/dev-mode',                   '/docs/tools/development/#development-and-production-builds'],
  // TODO(sorvell) https://github.com/lit/lit.dev/issues/455
  ['/msg/multiple-versions',          '/docs/tools/requirements/'],
  ['/msg/polyfill-support-missing',   '/docs/tools/requirements/#polyfills'],
  ['/msg/class-field-shadowing',      '/docs/components/properties/#avoiding-issues-with-class-fields'],
  // TODO(aomarks) Should we add something specifically about this issue?
  ['/msg/change-in-update',           '/docs/components/properties/#when-properties-change'],
  ['/msg/deprecated-import-path',     '/docs/releases/upgrade/#update-packages-and-import-paths'],
  ['/msg/removed-api',                '/docs/releases/upgrade/#litelement'],
  ['/msg/renamed-api',                '/docs/releases/upgrade/#update-to-renamed-apis'],
  ['/msg/undefined-attribute-value',  '/docs/releases/upgrade/#litelement'],
  ['/msg/request-update-promise',     '/docs/releases/upgrade/#litelement'],
  ['/msg/expression-in-template',     '/docs/templates/expressions/#invalid-locations'],
  ['/msg/expression-in-textarea',     '/docs/templates/expressions/#invalid-locations'],
  // Relocated pages
  ['/docs/libraries/localization',    '/docs/localization/overview/'],
].map(([path, redir]) => [
  // Trailing slashes are required because this redirect map is consulted after
  // standard lit.dev path canonicalization.
  path.match(/\/[^\/\.]+$/) ? path + '/' : path,
  redir,
]));
