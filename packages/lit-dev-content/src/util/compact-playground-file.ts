/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {SampleFile} from 'playground-elements/shared/worker-api.js';

export interface CompactPlaygroundFile {
  name: string;
  content: string;
  hidden?: true;
}

/**
 * Make a slightly more compact representation of the given Playground file.
 *
 * When base64-encoding a Playground project, we want something more compact to
 * reduce URL bloat. There's no need to include contentType (will be inferred
 * from filename) or labels (unused), and hidden should be omitted instead of
 * false.
 */
export const compactPlaygroundFile = (
  file: SampleFile
): CompactPlaygroundFile => {
  const compact: CompactPlaygroundFile = {
    name: file.name,
    content: file.content,
  };
  if (file.hidden) {
    compact.hidden = true;
  }
  return compact;
};
