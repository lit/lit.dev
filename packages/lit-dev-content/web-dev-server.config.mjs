/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {redirectMiddleware} from 'lit-dev-server/lib/middleware/redirect-middleware.js';

export default {
  middleware: [redirectMiddleware()],
  plugins: [
    {
      name: 'dont-resolve-sample-modules',
      async resolveImport({source, context}) {
        if (context.path.startsWith('/samples/')) {
          return source;
        }
      },
    },
    {
      // When we're using web-dev-server's --watch mode, we don't want our
      // playground project HTML files to get the injected web socket reload
      // script tag. This plugin reverses that transformation just for those
      // files. See https://github.com/modernweb-dev/web/issues/761 for a
      // feature request to make this easier.
      name: 'remove-injected-watch-script',
      transform(ctx) {
        if (ctx.url.startsWith('/samples/')) {
          return {
            body: ctx.body.replace(
              /<!-- injected by web-dev-server.*<\/script>/gs,
              ''
            ),
          };
        }
      },
    },
  ],
};
