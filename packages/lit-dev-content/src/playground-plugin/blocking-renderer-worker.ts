/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import * as workerthreads from 'worker_threads';
import {Renderer} from './renderer.js';
import {
  WorkerMessage,
  HandshakeMessage,
  Render,
  Shutdown,
} from './blocking-renderer.js';

if (workerthreads.isMainThread || !workerthreads.parentPort) {
  throw new Error('BlockingRenderer worker must be spawed in a worker thread');
}

const rendererPromise = Renderer.start();
const encoder = new TextEncoder();
let shuttingDown = false;

let sharedDataResolve: (value: HandshakeMessage) => void;
let sharedDataPromise = new Promise<HandshakeMessage>((resolve) => {
  sharedDataResolve = resolve;
});

const unreachable = (_x: never, msg: string) => new Error(msg);

workerthreads.parentPort.on('message', (msg: WorkerMessage) => {
  switch (msg.type) {
    case 'handshake':
      return onHandshake(msg);
    case 'render':
      return onRender(msg);
    case 'shutdown':
      return onShutdown(msg);
    default:
      throw unreachable(
        msg,
        `Unknown or missing message type: ${(msg as WorkerMessage).type}`
      );
  }
});

const onHandshake = (msg: HandshakeMessage) => {
  sharedDataResolve(msg);
};

const onRender = async (msg: Render) => {
  const renderer = await rendererPromise;
  const {html} = await renderer.render(msg.lang, msg.code);
  const shared = await sharedDataPromise;
  const length = html.length;
  if (length > shared.htmlBuffer.length) {
    throw new Error(
      `Shared HTML buffer was too short ` +
        `(${shared.htmlBuffer.length} < ${html.length} bytes)`
    );
  }
  shared.htmlBufferLength[0] = length;
  encoder.encodeInto(html, shared.htmlBuffer);
  Atomics.notify(shared.notify, 0);
};

const onShutdown = async (_msg: Shutdown) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  const renderer = await rendererPromise;
  await renderer.stop();
  process.exit(0);
};
