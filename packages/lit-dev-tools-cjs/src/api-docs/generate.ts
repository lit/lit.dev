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
import {litElement2Config} from './configs/lit-element-2.js';
import {litHtml1Config} from './configs/lit-html-1.js';

import type {ApiDocsConfig} from './types.js';

const execFileAsync = promisify(execFile);

const configs = [lit2Config, litElement2Config, litHtml1Config];

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
 * Return the SHA of the given commit reference.
 */
const shaOfReference = async (
  gitDir: string,
  reference: string
): Promise<string> => {
  const {stdout} = await execFileAsync(
    'git',
    ['show', '-s', '--format=%H', reference],
    {
      cwd: gitDir,
    }
  );
  return stdout.trim();
};

/**
 * Clone the given Git repo URL at the given commit into the given directory. If
 * the directory already exists, do nothing.
 */
const cloneIfNeeded = async (repo: string, commit: string, dir: string) => {
  if (await fileExists(dir)) {
    console.log(`${dir} already exists, skipping git clone`);
    const expectedSha = await shaOfReference(dir, commit);
    const actualSha = await shaOfReference(dir, 'HEAD');
    if (actualSha !== expectedSha) {
      throw new Error(
        `Git repo ${dir} is at commit ${actualSha}, but is configured for ${commit}. ` +
          `Update the config, or delete ${dir} and re-run this script to fix.`
      );
    }
    return;
  }
  console.log(`cloning git repo ${repo} to ${dir}`);
  await execFileAsync('git', ['clone', repo, dir]);
  console.log(`checking out commit ${commit}`);
  await execFileAsync('git', ['checkout', commit], {cwd: dir});
};

/**
 * Run NPM install and other given setup commands. If a node_modules/ directory
 * already exists in the given directory, do nothing.
 */
const setupIfNeeded = async (
  dir: string,
  extraCommands?: Array<{cmd: string; args: string[]}>
) => {
  if (await fileExists(pathlib.join(dir, 'node_modules'))) {
    console.log(`${dir}/node_modules already exists, skipping setup`);
    return;
  }
  console.log(`running npm ci in ${dir}`);
  await execFileAsync('npm', ['ci'], {cwd: dir});
  for (const {cmd, args} of extraCommands ?? []) {
    console.log(`running ${cmd} ${args.join(' ')} in ${dir}`);
    await execFileAsync(cmd, args, {cwd: dir});
  }
};

const analyze = async (config: ApiDocsConfig) => {
  await cloneIfNeeded(config.repo, config.commit, config.gitDir);
  await setupIfNeeded(config.gitDir, config.extraSetupCommands);

  const app = new typedoc.Application();
  app.options.addReader(new typedoc.TSConfigReader());
  app.bootstrap({
    tsconfig: config.tsConfigPath,
    entryPoints: config.entrypointModules,
  });
  const root = app.convert();
  if (!root) {
    throw new Error('TypeDoc.Application.convert() returned undefined');
  }

  const json = await app.serializer.projectToObject(root);
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
