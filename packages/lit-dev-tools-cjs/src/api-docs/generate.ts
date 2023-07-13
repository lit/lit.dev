/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as typedoc from 'typedoc';
import * as fs from 'fs/promises';
import * as pathlib from 'path';
import {execFile} from 'child_process';
import {promisify} from 'util';
import {ApiDocsTransformer} from './transformer.js';
import {lit2Config} from './configs/lit-2.js';
import {lit3Config} from './configs/lit-3.js';

import type {ApiDocsConfig} from './types.js';

const execFileAsync = promisify(execFile);

// Only generate documentation for most recent Lit versions.
const configs = [lit2Config, lit3Config];

/**
 * Check whether the given file path exists.
 */
const fileExists = async (path: string): Promise<boolean> => {
  try {
    await fs.stat(path);
    return true;
  } catch (err) {
    if ((err as {code?: string}).code !== 'ENOENT') {
      throw err;
    }
  }
  return false;
};

/**
 * Clone the given Git repo URL at the given commit into the given directory.
 */
const clone = async ({repo, gitDir, commit}: ApiDocsConfig) => {
  console.log(`cloning git repo ${repo} to ${gitDir} at ${commit}`);
  // This is the leanest way to shallow fetch just one commit without fetching
  // any other git history.
  await execFileAsync('git', ['init', gitDir]);
  await execFileAsync(
    'git',
    ['remote', 'add', 'origin', `https://github.com/${repo}`],
    {cwd: gitDir}
  );
  await execFileAsync('git', ['fetch', 'origin', '--depth=1', commit], {
    cwd: gitDir,
  });
  await execFileAsync('git', ['checkout', commit], {cwd: gitDir});
};

const INSTALLED_FILE = 'INSTALLED';

/**
 * Run NPM install and other given setup commands.
 */
const setup = async (config: ApiDocsConfig) => {
  console.log(`running npm ci in ${config.gitDir}`);
  await execFileAsync('npm', ['ci'], {cwd: config.gitDir});
  for (const {cmd, args} of config.extraSetupCommands ?? []) {
    console.log(`running ${cmd} ${args.join(' ')} in ${config.gitDir}`);
    await execFileAsync(cmd, args, {cwd: config.gitDir});
  }
  await fs.writeFile(pathlib.join(config.workDir, INSTALLED_FILE), '', 'utf8');
};

const analyze = async (config: ApiDocsConfig) => {
  const installedFilename = pathlib.join(config.workDir, INSTALLED_FILE);
  const installedFileExists = await fileExists(installedFilename);
  if (
    !installedFileExists ||
    (await fs.readFile(installedFilename, 'utf8')).trim() !== config.commit
  ) {
    if (installedFileExists) {
      await fs.rm(installedFilename);
    }
    if (await fileExists(config.gitDir)) {
      await fs.rm(config.gitDir, {recursive: true});
    }
    await clone(config);
    await setup(config);
    await fs.writeFile(installedFilename, config.commit, 'utf8');
  } else {
    console.log(`Re-using git repo ${config.gitDir}`);
  }

  console.log(`Analyzing ${config.gitDir}`);
  const app = new typedoc.Application();
  app.options.addReader(new typedoc.TSConfigReader());
  app.bootstrap({
    tsconfig: config.tsConfigPath,
    entryPoints: config.entrypointModules,
    entryPointStrategy: typedoc.EntryPointStrategy.Expand,
  });
  const root = app.convert();
  if (!root) {
    throw new Error('TypeDoc.Application.convert() returned undefined');
  }

  const json = await app.serializer.projectToObject(
    root,
    pathlib.resolve(config.tsConfigPath, '..')
  );
  const transformer = new ApiDocsTransformer(json, config);
  const {pages, symbolMap} = await transformer.transform();

  await fs.mkdir(pathlib.dirname(config.pagesOutPath), {recursive: true});
  await fs.writeFile(
    config.pagesOutPath,
    JSON.stringify(pages, null, 2),
    'utf8'
  );
  console.log(`Wrote ${config.pagesOutPath}`);

  await fs.mkdir(pathlib.dirname(config.symbolsOutPath), {recursive: true});
  await fs.writeFile(
    config.symbolsOutPath,
    JSON.stringify(symbolMap, null, 2),
    'utf8'
  );
  console.log(`Wrote ${config.symbolsOutPath}`);
};

const main = async () => {
  await Promise.all(configs.map((config) => analyze(config)));
};

main();
