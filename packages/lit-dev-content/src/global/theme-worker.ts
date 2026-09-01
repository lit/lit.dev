/**
 * @license
 * Copyright The Lit Project
 * SPDX-License-Identifier: Apache-2.0
 */

type ColorMode = 'light' | 'dark';

type ThemeWorkerMessage =
  | {
      type: 'connect' | 'system-mode';
      mode: ColorMode;
    }
  | {
      type: 'set-mode';
      mode: ColorMode;
    };

interface SharedWorkerScope {
  onconnect: ((event: MessageEvent) => void) | null;
}

const ports = new Set<MessagePort>();
let mode: ColorMode | undefined;

const isColorMode = (value: unknown): value is ColorMode =>
  value === 'light' || value === 'dark';

const publishMode = () => {
  if (!mode) {
    return;
  }

  for (const port of ports) {
    try {
      port.postMessage({type: 'mode', mode});
    } catch {
      ports.delete(port);
    }
  }
};

(globalThis as unknown as SharedWorkerScope).onconnect = ({ports: [port]}) => {
  if (!port) {
    return;
  }

  ports.add(port);
  port.addEventListener(
    'message',
    ({data}: MessageEvent<ThemeWorkerMessage>) => {
      if (!isColorMode(data?.mode)) {
        return;
      }

      switch (data.type) {
        case 'connect':
          if (mode === undefined) {
            mode = data.mode;
          }
          break;
        case 'system-mode':
          mode = data.mode;
          break;
        case 'set-mode':
          mode = data.mode;
          break;
      }

      publishMode();
    }
  );
  port.start();
};

export {};
