/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as playwright from 'playwright';
import * as pathlib from 'path';
import {startDevServer} from '@web/dev-server';
import {DevServer} from '@web/dev-server-core';

/**
 * Playwright-based renderer for playground-elements.
 */
export class Renderer {
  private server: RendererServer;
  private browser: playwright.Browser;
  private page: playwright.Page;
  private stopped = false;

  private constructor(
    server: RendererServer,
    browser: playwright.Browser,
    page: playwright.Page
  ) {
    this.server = server;
    this.browser = browser;
    this.page = page;
  }

  static async start(): Promise<Renderer> {
    return new Promise(async (resolve) => {
      const serverPromise = RendererServer.start();

      const browser = await playwright.chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      page.on('response', (response) => {
        const status = response.status();
        if (status < 200 || status >= 300) {
          console.error(
            `ERROR: playground-plugin renderer encountered HTTP ` +
              `${status} error fetching ${response.url()}`
          );
        }
      });

      page.on('pageerror', (error) => {
        console.error(
          `ERROR: playground-plugin renderer encountered page error: ` +
            error.message
        );
      });

      const body = `
        <!doctype html>
        <script type="module">
          import "/node_modules/playground-elements/playground-code-editor.js";
          window.editor = document.createElement('playground-code-editor');
          document.body.appendChild(window.editor);
        </script>
      `;
      const server = await serverPromise;
      const url = await server.serveOnce(body);
      await page.goto(url);

      resolve(new Renderer(server, browser, page));
    });
  }

  async stop() {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    await Promise.all([this.server.stop(), this.browser.close()]);
  }

  async render(
    lang: 'html' | 'css' | 'js' | 'ts',
    code: string
  ): Promise<{html: string}> {
    if (this.stopped) {
      throw new Error('Renderer has already stopped');
    }

    // We're re-using a single element on a single page across all renders, to
    // maximize render speed, because there is a very signifigant startup cost.
    // So because this is an async interface, we need to serialize render
    // requests to ensure they don't interfere. In the future we could introduce
    // a pool of browsers to take advantage of concurrent rendering.
    await this.getPageLock();

    try {
      type WindowWithEditor = typeof window & {
        editor: {
          shadowRoot: ShadowRoot;
          updateComplete: Promise<void>;
          type: string;
          value: string;
        };
      };
      const codemirrorHtml = await this.page.evaluate(
        async ([lang, code]) => {
          const editor = (window as WindowWithEditor).editor;
          editor.type = lang;
          editor.value = code;
          await editor.updateComplete;
          const cm = editor.shadowRoot.querySelector('.CodeMirror-code');
          if (cm === null) {
            throw new Error(
              '<codemirror-editor> did not render a ".CodeMirror-code" element'
            );
          }
          // The final line is sometimes (always?) an empty line containing just
          // a zero width space. Remove any final line that's only whitespace.
          // Note that RegExp "\s" doesn't include zero width spaces.
          const lastLine = cm.querySelector('.CodeMirror-line:last-of-type');
          if (lastLine?.textContent?.match(/^[\s\u200B]*$/)) {
            lastLine.remove();
          }

          // Replace zero width newlines that don't copy paste well with a line
          // feed unicode character that pastes correctly.
          const codeLines = cm.querySelectorAll(
            '.CodeMirror-line > span > span[cm-text]'
          );
          for (const line of codeLines) {
            if (line?.textContent?.match(/^[\u200B]*$/)) {
              line.textContent = `\u000A`;
            }
          }

          return cm.innerHTML;
        },
        [lang, code]
      );
      const html = `<figure class="CodeMirror cm-s-default">${codemirrorHtml}</figure>`;
      return {html};
    } finally {
      this.releasePageLock();
    }
  }

  private numLockWaiters = 0;
  private lockWaiterResolves: Array<() => void> = [];

  private getPageLock(): void | Promise<void> {
    this.numLockWaiters++;
    if (this.numLockWaiters > 1) {
      return new Promise((resolve) => {
        this.lockWaiterResolves.push(resolve);
      });
    }
  }

  private releasePageLock(): void {
    this.numLockWaiters--;
    if (this.numLockWaiters > 0) {
      const resolve = this.lockWaiterResolves.shift()!;
      resolve();
    }
  }
}

/**
 * HTTP server for the Playwright renderer.
 */
class RendererServer {
  private wds: DevServer;
  private bodyMap: Map<string, string>;
  private nextId = 0;

  private constructor(wds: DevServer, bodyMap: Map<string, string>) {
    this.wds = wds;
    this.bodyMap = bodyMap;
  }

  static async start(): Promise<RendererServer> {
    const bodyMap = new Map<string, string>();
    return new Promise(async (resolve) => {
      // Stop Web Dev Server from taking over the whole terminal.
      const realWrite = process.stdout.write;
      process.stdout.write = (() => {}) as any;
      const wds = await startDevServer({
        config: {
          // playground-elements is hoisted to the root node_modules by
          // workspaces.
          rootDir: pathlib.resolve(__dirname, '..', '..', '..', '..'),
          preserveSymlinks: true, // Needed when a dependency is NPM linked
          nodeResolve: true,
          middleware: [
            async (ctx, next) => {
              if (ctx.URL.pathname !== '/') {
                return next();
              }
              const id = ctx.URL.searchParams.get('id');
              if (id === null) {
                return next();
              }
              const body = bodyMap.get(id);
              if (body === undefined) {
                return next();
              }
              ctx.response.type = 'text/html';
              ctx.response.body = body;
              bodyMap.delete(id);
            },
          ],
        },
      });
      process.stdout.write = realWrite;
      resolve(new RendererServer(wds, bodyMap));
    });
  }

  async stop(): Promise<void> {
    await this.wds.stop();
  }

  /**
   * Generate a URL that will serve the given HTML body exactly one time. Once
   * the URL has been requested, it will become invalid.
   */
  serveOnce(body: string): string {
    const id = String(this.nextId++);
    this.bodyMap.set(id, body);
    return `http://localhost:${this.wds.config.port}/?id=${id}`;
  }
}
