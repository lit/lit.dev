/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as workerthreads from 'worker_threads';
import * as pathlib from 'path';

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

// This is the max number of active workers that are allowed.
const MAX_WORKERS = 10;
const PORT = 8005;

export class BlockingRenderer {
  private pool = Array.from(new Array(MAX_WORKERS)).map(
    (_, idx) =>
      new BlockingRenderer_instance({
        renderTimeout: 60_000,
        maxHtmlBytes: 1024 * 1024,
        port: PORT + idx,
      })
  );
  // The number of active renders being calculated.
  private sharedActiveWorkers = new Int32Array(new SharedArrayBuffer(4));

  render(lang: 'js' | 'ts' | 'html' | 'css', code: string): {html: string} {
    const sharedActiveWorkers = this.sharedActiveWorkers;
    // Block more than 10 concurrent active renders.
    while (Atomics.load(sharedActiveWorkers, 0) >= MAX_WORKERS) {
      Atomics.wait(sharedActiveWorkers, 0, MAX_WORKERS);
    }
    Atomics.add(sharedActiveWorkers, 0, 1);

    const idleWorker = this.pool.find((worker) => worker.state === 'idle');
    if (!idleWorker) {
      throw new Error(`BlockingRenderer worker pool exhausted.`);
    }
    const result = idleWorker.render(lang, code);

    // Worker has completed, so subtract the number of active workers.
    Atomics.sub(sharedActiveWorkers, 0, 1);
    Atomics.notify(sharedActiveWorkers, 0, 1);
    return result;
  }

  async stop(): Promise<void[]> {
    return Promise.all(this.pool.map((w) => w.stop()));
  }
}

class BlockingRenderer_instance {
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

  #state: 'idle' | 'busy' = 'idle';
  get state(): 'idle' | 'busy' | 'stopped' {
    if (this.exited) {
      return 'stopped';
    }
    return this.#state;
  }

  constructor({
    renderTimeout = 60_000,
    maxHtmlBytes = 1024 * 1024,
    port = 8005,
  } = {}) {
    this.renderTimeout = renderTimeout;
    this.sharedHtml = new Uint8Array(new SharedArrayBuffer(maxHtmlBytes));
    this.worker = new workerthreads.Worker(
      pathlib.join(__dirname, 'blocking-renderer-worker.js'),
      {workerData: {port}}
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

  render(lang: 'js' | 'ts' | 'html' | 'css', code: string): {html: string} {
    if (this.exited) {
      throw new Error('BlockingRenderer worker has already exited');
    }
    this.#state = 'busy';
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
    this.#state = 'idle';
    return {html};
  }

  private workerPost(message: WorkerMessage) {
    this.worker.postMessage(message);
  }
}
