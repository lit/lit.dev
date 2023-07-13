/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import glob from 'fast-glob';
import {promisify} from 'util';
import * as zlib from 'zlib';
import * as fs from 'fs/promises';
const brotliCompress = promisify(zlib.brotliCompress);
const gzipCompress = promisify(zlib.gzip);

/**
 * Pre-compress assets with Brotli and GZip.
 *
 * For each file matched by the given glob, write an adjacent .br (Brotli) and
 * .gz (GZip) file. Only compresses files that are >1500 bytes (typical MTU
 * size), and where the compression ratio is >1. Runs at the end of the Eleventy
 * build.
 *
 * Koa support:
 *   https://github.com/koajs/static#options
 *
 * Nginx support:
 *   https://github.com/google/ngx_brotli#brotli_static
 *   https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html
 */
export const preCompress = async (opts: {glob: string}) => {
  const startTime = Date.now();
  const stats = {
    numFiles: 0,
    inBytes: 0,

    brNumFiles: 0,
    brInBytes: 0,
    brOutBytes: 0,

    gzNumFiles: 0,
    gzInBytes: 0,
    gzOutBytes: 0,
  };

  const handleFile = async (path: string) => {
    if (path.endsWith('.br') || path.endsWith('.gz')) {
      // Skip already compressed files (e.g. our own outputs from a previous
      // build).
      return;
    }

    const fileBuffer = await fs.readFile(path);
    stats.numFiles++;
    stats.inBytes += fileBuffer.length;
    const brPath = path + '.br';
    const gzPath = path + '.gz';

    if (fileBuffer.length <= 1500) {
      // No point compressing anything that already fits in one typical MTU.
      //
      // There might be a compressed version of this file from a previous
      // build. This can happen it the source file became smaller. We need to
      // clean it up, or else a server might keep serving the stale compressed
      // version instead of the latest uncompressed version.
      await Promise.all([unlinkIfExists(brPath), unlinkIfExists(gzPath)]);
      return;
    }

    const brDone = (async () => {
      const compressed = await brotliCompress(fileBuffer);
      if (compressed.length < fileBuffer.length) {
        await fs.writeFile(brPath, compressed);
        stats.brNumFiles++;
        stats.brInBytes += fileBuffer.length;
        stats.brOutBytes += compressed.length;
      } else {
        // Remove possibly stale previous version (see above).
        await unlinkIfExists(brPath);
      }
    })();

    const gzDone = (async () => {
      const compressed = await gzipCompress(fileBuffer, {level: 9});
      if (compressed.length < fileBuffer.length) {
        await fs.writeFile(gzPath, compressed);
        stats.gzNumFiles++;
        stats.gzInBytes = fileBuffer.length;
        stats.gzOutBytes += compressed.length;
      } else {
        // Remove possibly stale previous version (see above).
        await unlinkIfExists(gzPath);
      }
    })();

    await Promise.all([brDone, gzDone]);
  };

  const files = await glob(opts.glob);
  await Promise.all(files.map(handleFile));

  const stopTime = Date.now();
  const seconds = (stopTime - startTime) / 1000;
  const mib = (b: number) => (b / 1024 / 1024).toFixed(2) + ' MiB';
  console.log(
    `[Compress] Processed ${stats.numFiles} files (${mib(
      stats.inBytes
    )}) in ${seconds.toFixed(1)} seconds`
  );

  const brSaved = stats.brInBytes - stats.brOutBytes;
  const brRatio = stats.brInBytes / stats.brOutBytes;
  console.log(
    `[Compress] Created ${stats.brNumFiles} .br files / Ratio ${brRatio.toFixed(
      1
    )} to 1 / Saved ${mib(brSaved)}`
  );

  const gzSaved = stats.gzInBytes - stats.gzOutBytes;
  const gzRatio = stats.gzInBytes / stats.gzOutBytes;
  console.log(
    `[Compress] Created ${stats.gzNumFiles} .gz files / Ratio ${gzRatio.toFixed(
      1
    )} to 1 / Saved ${mib(gzSaved)}`
  );
};

const unlinkIfExists = async (path: string): Promise<boolean> => {
  try {
    await fs.unlink(path);
    return true;
  } catch (e) {
    if ((e as {code: string}).code === 'ENOENT') {
      return false;
    }
    throw e;
  }
};
