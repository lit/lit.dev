/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  Worker,
  MessageChannel,
  MessagePort,
  receiveMessageOnPort,
} from 'worker_threads';
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
  port: MessagePort;
}

export interface Render {
  type: 'render';
  lang: 'js' | 'ts' | 'html' | 'css';
  code: string;
}

export interface Shutdown {
  type: 'shutdown';
}

export class BlockingRenderer {
  /** Worker that performs rendering. */
  private worker: Worker;
  /** Shared memory that the worker will write render results into. */
  private sharedHtml: Uint8Array;
  /** Shared memory that the worker will set to the result length. */
  private sharedLength = new Int32Array(new SharedArrayBuffer(4));
  /* Shared memory for done notifications. */
  private sharedNotify = new Int32Array(new SharedArrayBuffer(4));
  // private decoder = new TextDecoder();
  private exited = false;
  private renderTimeout: number;
  private port: MessagePort;

  constructor({renderTimeout = 60_000, maxHtmlBytes = 1024 * 1024} = {}) {
    this.renderTimeout = renderTimeout;
    this.sharedHtml = new Uint8Array(new SharedArrayBuffer(maxHtmlBytes));
    this.worker = new Worker(
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
    const {port1, port2} = new MessageChannel();
    this.port = port1;
    // this.workerPost({
    //   type: 'handshake',
    //   htmlBufferLength: this.sharedLength,
    //   htmlBuffer: this.sharedHtml,
    //   notify: this.sharedNotify,
    //   port: port2
    // });
    this.worker.postMessage(
      {
        type: 'handshake',
        htmlBufferLength: this.sharedLength,
        htmlBuffer: this.sharedHtml,
        notify: this.sharedNotify,
        port: port2,
      },
      [port2]
    );
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
    this.port.postMessage({type: 'render', lang, code});
    // this.workerPost({type: 'render', lang, code});
    console.log(`posted ${code.slice(0, 20)}`);
    if (
      Atomics.wait(this.sharedNotify, 0, 0, this.renderTimeout) === 'timed-out'
    ) {
      throw new Error(
        `BlockingRenderer timed out waiting for worker to render ${lang}`
      );
    }
    const {message} = receiveMessageOnPort(this.port)!;
    // const raw = this.decoder.decode(this.sharedHtml);
    // const length = this.sharedLength[0];
    // const html = raw.substring(0, length);
    return {html: message};
  }

  private workerPost(message: WorkerMessage) {
    this.worker.postMessage(message);
  }
}
