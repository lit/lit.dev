/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {GistFiles} from '../github/github-gists.js';
import type {SampleFile} from 'playground-elements/shared/worker-api.js';

/**
 * Additional playground metadata that we can't encode in basic gist file
 * primitives.
 */
type GistPlaygroundMetadata = {
  files?: {
    [filename: string]: {
      /** File display order. Gist files are always returned alphabetically. */
      position?: number;
      /** Whether the file is hidden. */
      hidden?: boolean;
    };
  };
};

/**
 * Filename for gist playground metadata.
 *
 * Note that the "zzzzzzzzzz" prefix is chosen to encourage this file to come
 * last in the list of Gist files. GitHub uses the first file as title of the
 * Gist, so it's better for that to be one of the user's files. GitHub uses an
 * unusual sorting scheme where characters like _-@#$ come before letters (see
 * https://gist.github.com/fliedonion/6057f4a3a533f7992c60), so we can't use any
 * of those.
 */
const METADATA_FILENAME = 'zzzzzzzzzz-lit-dev-playground-metadata.json';

/**
 * Convert an array of Playground files to a GitHub gist.
 */
export const playgroundToGist = (playgroundFiles: SampleFile[]): GistFiles => {
  const metadata: GistPlaygroundMetadata = {
    files: Object.fromEntries(
      playgroundFiles.map(({name, hidden}, position) => {
        const entry: Required<GistPlaygroundMetadata>['files'][string] = {
          position,
        };
        if (hidden) {
          entry.hidden = true;
        }
        return [name, entry];
      })
    ),
  };
  const gistFiles: GistFiles = Object.fromEntries(
    playgroundFiles
      // Gist files can't be empty. But because an empty file will still have a
      // metadata entry, we'll still know it exists when we load it later.
      .filter(({content}) => content !== '')
      .map(({name, content}) => [name, {content}])
  );
  gistFiles[METADATA_FILENAME] = {
    content: JSON.stringify(metadata, null, 2),
  };
  return gistFiles;
};

/**
 * Convert a GitHub gist to an array of Playground files.
 */
export const gistToPlayground = (gistFiles: GistFiles): SampleFile[] => {
  const metadataFile = gistFiles[METADATA_FILENAME];
  let metadata: GistPlaygroundMetadata = {files: {}};
  if (metadataFile) {
    try {
      metadata =
        (JSON.parse(
          metadataFile.content
        ) as GistPlaygroundMetadata) /* in case it is null */ || {};
    } catch (error) {
      console.warn('Failed to JSON parse playground metadata file in gist');
    }
  }
  const playgroundFiles: {[name: string]: SampleFile} = {};
  for (const gistFile of Object.values(gistFiles)) {
    if (gistFile === metadataFile || !gistFile.filename) {
      continue;
    }
    const file: SampleFile = {
      name: gistFile.filename,
      content: gistFile.content,
    };
    playgroundFiles[file.name] = file;
  }
  for (const [name, {hidden}] of Object.entries(metadata.files || {})) {
    let playgroundFile = playgroundFiles[name];
    if (!playgroundFile) {
      playgroundFile = {name, content: ''};
      playgroundFiles[name] = playgroundFile;
    }
    if (hidden) {
      playgroundFile.hidden = true;
    }
  }
  return Object.values(playgroundFiles).sort((a, b) => {
    const aPos = metadata.files?.[a.name]?.position;
    const bPos = metadata.files?.[b.name]?.position;
    // Check types because this metadata file can theoretically contain
    // anything, since they can easily be edited by a user directly from the
    // GitHub gist UI.
    if (typeof aPos === 'number' && typeof bPos === 'number') {
      return aPos - bPos;
    }
    return 0;
  });
};
