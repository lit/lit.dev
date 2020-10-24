/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import * as playwright from 'playwright';
import * as pathlib from 'path';
import {startDevServer} from '@web/dev-server';
import {DevServer} from '@web/dev-server-core';
import {outdent} from 'outdent';

/**
 * Playwright-based renderer for playground-elements.
 */
export class Renderer {
  private server: RendererServer;
  private browser: playwright.Browser;

  private constructor(server: RendererServer, browser: playwright.Browser) {
    this.server = server;
    this.browser = browser;
  }

  static async start(): Promise<Renderer> {
    return new Promise(async (resolve) => {
      const browser = playwright.chromium.launch();
      const server = RendererServer.start();
      resolve(new Renderer(await server, await browser));
    });
  }

  async stop() {
    await Promise.all([this.server.stop(), this.browser.close()]);
  }

  async render(
    type: 'html' | 'css' | 'js' | 'ts',
    code: string
  ): Promise<{html: string}> {
    const body = `
      <!doctype html>
      <script type="module">
        import "/node_modules/code-sample-editor/lib/code-sample.js";
      </script>

      <code-sample>
        <script type="sample/${type}" filename="file.${type}">
${outdent`${code}`}
        </script>
      </code-sample-project>
    `;
    const url = this.server.serveOnce(body);
    const context = await this.browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    // Note playwright pierces shadow roots automatically.
    const cm = await page.waitForSelector('.CodeMirror-code');
    const html = `<div class="CodeMirror cm-s-default">${await cm.innerHTML()}</div>`;
    return {html};
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
      const wds = await startDevServer({
        config: {
          rootDir: pathlib.resolve(__dirname, '..'),
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
