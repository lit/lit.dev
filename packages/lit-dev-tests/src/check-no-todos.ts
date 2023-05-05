/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Our `api.html` generator template fails by rendering a `TODO`. For example
 * see issue https://github.com/lit/lit.dev/issues/1097.
 *
 * This means when upgrading infrastructure, it can sometimes become a subtle
 * error that needs manual scavenging for errant TODO's. This test scans built
 * HTML files for instances of TODO - and breaks tests if one is found.
 */

import {readFileSync} from 'fs';
import * as pathLib from 'path';
import {fileURLToPath} from 'url';
import ansi from 'ansi-escape-sequences';

const {red, green, yellow, bold, reset} = ansi.style;

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathLib.dirname(__filename);
const siteOutputDir = pathLib.resolve(
  __dirname,
  '../',
  '../',
  'lit-dev-content',
  '_site'
);

const api_pages_to_check = [
  pathLib.resolve(siteOutputDir, 'docs/api/controllers/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/custom-directives/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/decorators/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/directives/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/LitElement/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/misc/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/ReactiveElement/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/static-html/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/styles/index.html'),
  pathLib.resolve(siteOutputDir, 'docs/api/templates/index.html'),
];

const checkNoTodos = async () => {
  console.log('==========================================');
  console.log("Checking lit.dev generated API for TODO's");
  console.log('==========================================');
  console.log();

  let fail = false;

  for (const page of api_pages_to_check) {
    const content = readFileSync(page, {encoding: 'utf8'});

    if (content.includes(`"error-fallback-todo"`)) {
      fail = true;
      console.log(`${bold + red}FOUND TODO${reset} ${yellow + page + reset}`);
    }
  }

  console.log();
  if (fail) {
    console.log(
      `${bold + red}Found TODOs in generated  API documentation!${reset}`
    );
    process.exit(1);
  } else {
    console.error(
      `${bold + green}Generated API does not contain any TODOs!${reset}`
    );
  }
};

checkNoTodos();
