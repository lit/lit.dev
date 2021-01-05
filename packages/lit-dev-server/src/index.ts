/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import Koa from 'koa';
import koaCompress from 'koa-compress';
import koaStatic from 'koa-static';
import koaConditionalGet from 'koa-conditional-get';
import koaEtag from 'koa-etag';
import {createRequire} from 'module';
import * as path from 'path';

const require = createRequire(import.meta.url);
const contentPackage = require.resolve('lit-dev-content');
const contentDir = path.dirname(contentPackage);

console.log('contentPackage', contentPackage);
console.log('contentDir', contentDir);

const app = new Koa();
app.use(koaConditionalGet()); // Needed for etag
app.use(koaEtag());
app.use(koaCompress());
app.use(koaStatic(contentDir));

const port = process.env.PORT || 8080;
app.listen(port);
console.log(`server listening on port ${port}`);
