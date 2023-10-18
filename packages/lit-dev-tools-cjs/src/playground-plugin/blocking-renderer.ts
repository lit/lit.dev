/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as workerthreads from 'worker_threads';
import * as pathlib from 'path';
import * as fs from 'fs';

const cachedHighlightsDir = pathlib.resolve(
  __dirname,
  '../../.highlights_cache/'
);

export type WorkerMessage = HandshakeMessage | Render | Shutdown;

export interface HandshakeMessage {
  type: 'handshake';
  /** UTF-8 rendered HTML. */
  htmlBuffer: Uint8Array;
  /** The length of htmlBuffer in bytes, stored at array index 0. */
  htmlBufferLength: Int32Array;
  /**
   * The worker will awaken the thread waiting on index 0 of this array when
   * each render is done, and the value will always be 0.
   */
  notify: Int32Array;
}

export interface Render {
  type: 'render';
  lang: 'js' | 'ts' | 'html' | 'css';
  code: string;
}

export interface Shutdown {
  type: 'shutdown';
}

const highlightKey = (lang: string, code: string) => `[${lang}]:${code}`;

// Create a cache key for the highlighted strings. This is a
// simple digest build from a DJB2-ish hash modified from:
// https://github.com/darkskyapp/string-hash/blob/master/index.js
// It is modified from @lit-labs/ssr-client.
// Goals:
//  - Extremely low collision rate. We may not be able to detect collisions.
//  - Extremely fast.
//  - Extremely small code size.
//  - Safe to include in HTML comment text or attribute value.
//  - Easily specifiable and implementable in multiple languages.
// We don't care about cryptographic suitability.
export const digestToFileName = (stringToDigest: string) => {
  // Number of 32 bit elements to use to create template digests
  const digestSize = 5;
  const hashes = new Uint32Array(digestSize).fill(5381);
  for (let i = 0; i < stringToDigest.length; i++) {
    hashes[i % digestSize] =
      (hashes[i % digestSize] * 33) ^ stringToDigest.charCodeAt(i);
  }
  const str = String.fromCharCode(...new Uint8Array(hashes.buffer));
  return Buffer.from(str, 'binary')
    .toString('base64')
    .replace(/[<>:"'/\\|?*]/g, '_');
};

export class BlockingRenderer {
  /** Worker that performs rendering. */
  private worker: workerthreads.Worker;
  /** Shared memory that the worker will write render results into. */
  private sharedHtml: Uint8Array;
  /** Shared memory that the worker will set to the result length. */
  private sharedLength = new Int32Array(new SharedArrayBuffer(4));
  /* Shared memory for done notifications. */
  private sharedNotify = new Int32Array(new SharedArrayBuffer(4));
  private decoder = new TextDecoder();
  private exited = false;
  private renderTimeout: number;
  private isDevMode = false;

  constructor({
    renderTimeout = 60_000,
    maxHtmlBytes = 1024 * 1024,
    isDevMode = false,
  } = {}) {
    this.isDevMode = isDevMode;
    this.renderTimeout = renderTimeout;
    this.sharedHtml = new Uint8Array(new SharedArrayBuffer(maxHtmlBytes));
    this.worker = new workerthreads.Worker(
      pathlib.join(__dirname, 'blocking-renderer-worker.js')
    );
    this.worker.on('error', (error) => {
      throw new Error(
        `BlockingRenderer worker encountered error: ${error.message}`
      );
    });
    this.worker.on('exit', (code) => {
      this.exited = true;
      if (code !== 0) {
        throw new Error(
          `BlockingRenderer worker unexpectedly exited with code ${code}`
        );
      }
    });
    this.workerPost({
      type: 'handshake',
      htmlBufferLength: this.sharedLength,
      htmlBuffer: this.sharedHtml,
      notify: this.sharedNotify,
    });
    try {
      fs.mkdirSync(cachedHighlightsDir);
    } catch {
      // Directory already exists.
    }
  }

  async stop(): Promise<void> {
    if (this.exited) {
      return;
    }
    return new Promise((resolve) => {
      this.worker.on('exit', () => resolve());
      this.workerPost({type: 'shutdown'});
    });
  }

  private getCachedRender(lang: string, code: string): string | null {
    if (!this.isDevMode) {
      return null;
    }
    const fileName = digestToFileName(highlightKey(lang, code));
    const absoluteFilePath = pathlib.resolve(cachedHighlightsDir, fileName);
    if (fs.existsSync(absoluteFilePath)) {
      return fs.readFileSync(absoluteFilePath, {encoding: 'utf8'});
    }
    return null;
  }

  private writeCachedRender(lang: string, code: string, html: string) {
    if (!this.isDevMode) {
      // In production mode, don't write out cached files.
      return;
    }
    const fileName = digestToFileName(highlightKey(lang, code));
    const absoluteFilePath = pathlib.resolve(cachedHighlightsDir, fileName);
    fs.writeFileSync(absoluteFilePath, html);
  }

  render(lang: 'js' | 'ts' | 'html' | 'css', code: string): {html: string} {
    if (this.exited) {
      throw new Error('BlockingRenderer worker has already exited');
    }
    const cachedResult = this.getCachedRender(lang, code);
    if (cachedResult !== null) {
      return {html: cachedResult};
    }
    this.workerPost({type: 'render', lang, code});
    if (
      Atomics.wait(this.sharedNotify, 0, 0, this.renderTimeout) === 'timed-out'
    ) {
      throw new Error(
        `BlockingRenderer timed out waiting for worker to render ${lang}`
      );
    }
    const raw = this.decoder.decode(this.sharedHtml);
    const length = this.sharedLength[0];
    const html = raw.substring(0, length);
    this.writeCachedRender(lang, code, html);
    return {html};
  }

  private workerPost(message: WorkerMessage) {
    this.worker.postMessage(message);
  }
}
