/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  compileTypeScriptOnce,
  InvokeTypeScriptOpts,
} from './typescript-util.js';

import pathlib from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import {fileURLToPath} from 'url';

import {
  idiomaticDecoratorsTransformer,
  preserveBlankLinesTransformer,
  constructorCleanupTransformer,
  BLANK_LINE_PLACEHOLDER_COMMENT_REGEXP,
} from '@lit/ts-transformers';
import prettier from 'prettier';
import fastGlob from 'fast-glob';

import type {ProjectManifest} from 'playground-elements/shared/worker-api';

const THIS_DIR = pathlib.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = pathlib.join(THIS_DIR, '..', '..', '..');
const TS_SAMPLES_DIR = pathlib.join(
  REPO_DIR,
  'packages',
  'lit-dev-content',
  'samples'
);
const JS_SAMPLES_DIR = pathlib.join(TS_SAMPLES_DIR, 'js');

/**
 * Copy a Playground project.json file from the samples/ dir to the samples/js/
 * dir, replacing any .ts filenames with the .js version.
 */
const updateAndWriteProjectConfig = async (
  relPath: string,
  ignoreJsonError = false
) => {
  const absPath = pathlib.join(TS_SAMPLES_DIR, relPath);
  const oldJson = await fs.readFile(absPath, 'utf8');
  let project: ProjectManifest;
  try {
    project = JSON.parse(oldJson) as ProjectManifest;
  } catch (e) {
    const msg = `Invalid JSON in ${relPath}: ${(e as Error).message}`;
    if (ignoreJsonError) {
      // It's expected during watch mode that we'll get JSON parse errors, e.g.
      // when the user first creates an empty project.json file. Don't exit the
      // entire watch script, just show the error and skip it until it's fixed.
      console.error(msg);
      return;
    }
    throw new Error(msg);
  }
  if (project.files) {
    // Note we create a new files object here because we want to preserve the
    // original property order, since that affects displayed tab order, which a
    // delete + assign would not do. (Side note: this is probably a sign that
    // the Playground project files property should be an array instead of a
    // data object).
    const newFiles: typeof project.files = {};
    for (const [fileName, options] of Object.entries(project.files)) {
      const newFileName = fileName
        .replace(/\.ts$/, '.js')
        .replace(/\.tsx$/, '.jsx');
      newFiles[newFileName] = options;
    }
    project.files = newFiles;
  }
  const outPath = pathlib.join(JS_SAMPLES_DIR, relPath);
  await fs.mkdir(pathlib.dirname(outPath), {recursive: true});
  const newJson = JSON.stringify(project, null, 4);
  await fs.writeFile(outPath, newJson, 'utf8');
};

/**
 * Symlink a file from the samples/ dir to the samples/js/ dir.
 *
 * Symlinking is better when we can because we don't need to copy on every
 * modification, which is wasteful and could trigger double reloads of the dev
 * server.
 */
const symlinkProjectFile = async (relPath: string) => {
  const absPath = pathlib.join(TS_SAMPLES_DIR, relPath);
  const outPath = pathlib.join(JS_SAMPLES_DIR, relPath);
  await fs.mkdir(pathlib.dirname(outPath), {recursive: true});
  try {
    // In case a file/symlink already exists.
    await fs.unlink(outPath);
  } catch (e) {
    if ((e as {code: string}).code !== 'ENOENT') {
      throw e;
    }
  }
  await fs.symlink(absPath, outPath);
};

const isProjectConfig = (path: string) =>
  pathlib.basename(path) === 'project.json';

const tsCompileOpts: InvokeTypeScriptOpts = {
  tsConfigPath: pathlib.join(TS_SAMPLES_DIR, 'tsconfig.json'),

  transformersFactory: (program) => ({
    before: [
      // Preserve blank lines by inserting a special comment.
      preserveBlankLinesTransformer(),
      // Transform Lit decorators to idiomatic vanilla JavaScript.
      idiomaticDecoratorsTransformer(program),
    ],
    after: [
      // Readability improvements for constructors.
      constructorCleanupTransformer(program),
    ],
  }),

  transformJs: (js, filepath) => {
    // Replace the special blank line placeholder comments from
    // preserveBlankLinesTransformer.
    js = js.replace(BLANK_LINE_PLACEHOLDER_COMMENT_REGEXP, '\n');

    // Prettier does a nicer job than TypeScript's built-in formatter.
    js = prettier.format(js, {
      parser: 'typescript',
      singleQuote: true,
      bracketSpacing: false,
      embeddedLanguageFormatting: 'off',
    });

    const jsPath = pathlib.relative(process.cwd(), filepath);
    const playgroundCommentRegexp =
      /\/\*\s*(playground-(fold|hide)(-end)?)\s\*\//g;
    const tsPath = jsPath
      .replace(/^samples\/js\//, 'samples/')
      .replace(/\.js$/, '.ts')
      .replace(/\.jsx$/, '.tsx');
    const ts = fsSync.readFileSync(tsPath, 'utf8');
    const tsPlaygroundComments = [...ts.matchAll(playgroundCommentRegexp)].map(
      ([, kind]) => kind
    );
    const jsPlaygroundComments = [...js.matchAll(playgroundCommentRegexp)].map(
      ([, kind]) => kind
    );
    if (tsPlaygroundComments.join(';') !== jsPlaygroundComments.join(';')) {
      const msg =
        `Mismatched playground hide/fold comments:` +
        `\n  ${tsPath}` +
        `\n  ${jsPath}\n`;
      throw new Error(msg);
    }
    return js;
  },
};

const nonTsFileGlobs = [
  '**/*',
  // Don't read our own output dir.
  '!js/**/*',
  // TypeScript files are handled separately
  '!*.ts',
  '!**/*.ts',
  // TypeScript files are handled separately
  '!*.tsx',
  '!**/*.tsx',
  // These config files are unnecessary.
  '!tsconfig.json',
  '!base.json',
];

const files = await fastGlob(nonTsFileGlobs, {cwd: TS_SAMPLES_DIR});
for (const path of files) {
  if (isProjectConfig(path)) {
    updateAndWriteProjectConfig(path);
  } else {
    symlinkProjectFile(path);
  }
}
if (!compileTypeScriptOnce(tsCompileOpts)) {
  console.error('TypeScript compilation failed');
  process.exitCode = 1;
} else {
  console.log('\nSuccess!\n');
}
