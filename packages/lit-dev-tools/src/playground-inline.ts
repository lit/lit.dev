/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import glob from 'fast-glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import {ProjectManifest} from 'playground-elements/shared/worker-api.js';

/**
 * Given a glob of Playground JSON manifest files, read every file in the
 * project, inline its contents directly into the manifest, and delete the
 * original project files.
 */
export const inlinePlaygroundFilesIntoManifests = async (
  globPattern: string
) => {
  const files = (await glob(globPattern)) as string[];
  const toDelete = new Set<string>();
  await Promise.all(
    files.map(async (manifestPath) => {
      const manifestStr = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestStr) as ProjectManifest;
      for (const [fileName, fileOpts] of Object.entries(manifest.files ?? {})) {
        if (fileOpts.content !== undefined) {
          continue;
        }
        const filePath = path.resolve(path.dirname(manifestPath), fileName);
        const fileStr = await fs.readFile(filePath, 'utf8');
        fileOpts.content = fileStr;
        toDelete.add(filePath);
      }
      // Write even if nothing changed, since we might as well also minify.
      const updated = JSON.stringify(manifest);
      if (updated !== manifestStr) {
        await fs.writeFile(manifestPath, updated, 'utf8');
      }
    })
  );

  // Delete files after inlining, in case two manifests referenced the same file
  // for some reason.
  await Promise.all([...toDelete].map((filepath) => fs.unlink(filepath)));
};
