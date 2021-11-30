/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as typedoc from 'typedoc';
import * as fs from 'fs/promises';
import {ApiDocsTransformer} from './transformer.js';
import {lit2Config} from './configs/lit-2.js';

async function main() {
  const app = new typedoc.Application();
  app.options.addReader(new typedoc.TSConfigReader());
  app.bootstrap({
    tsconfig: lit2Config.tsConfigPath,
    entryPoints: lit2Config.entrypointModules,
  });
  const root = app.convert();
  if (!root) {
    throw new Error('TypeDoc.Application.convert() returned undefined');
  }

  const json = await app.serializer.projectToObject(root);
  const transformer = new ApiDocsTransformer(json, lit2Config);
  const {pages, symbolMap} = await transformer.transform();

  await fs.writeFile(
    lit2Config.pagesOutPath,
    JSON.stringify(pages, null, 2),
    'utf8'
  );
  console.log(`Wrote ${lit2Config.pagesOutPath}`);
  await fs.writeFile(
    lit2Config.symbolsOutPath,
    JSON.stringify(symbolMap, null, 2),
    'utf8'
  );
  console.log(`Wrote ${lit2Config.symbolsOutPath}`);
}

main();
