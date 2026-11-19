import {test, expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import type {PlaygroundProject} from 'playground-elements/playground-project.js';

import {preventGDPRBanner} from './util.js';

interface PlaygroundToolResult {
  status?: string;
  compiled?: boolean;
  applied?: boolean;
  diagnostics?: Array<{path: string; code: number; message: string}>;
  error?: string;
  result?: {
    element?: {tag: string};
    properties?: Record<string, unknown>;
    count?: number;
    entries?: Array<{message: string}>;
  };
}

interface RegisteredPlaygroundTool {
  name: string;
  execute: (
    input: Record<string, unknown>,
    options: {signal: AbortSignal}
  ) => Promise<PlaygroundToolResult | string>;
}

declare global {
  interface Window {
    playgroundTools: Map<string, RegisteredPlaygroundTool>;
  }
}

const agentProjectUrl =
  '/playground/#project=' +
  Buffer.from(
    JSON.stringify([
      {
        name: 'index.html',
        content:
          '<!doctype html><!-- <head> --><html><HEAD data-label="a > b"><noscript><p id="noscript-only">Scripting disabled</p></noscript><script>console.log("inline startup")</script><script type="module" src="./main.js"></script></HEAD><body><agent-counter></agent-counter></body></html>',
      },
      {
        name: 'main.ts',
        content: `
class AgentCounter extends HTMLElement {
  count = 0;
  constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = '<button>0</button>';
    root.querySelector('button')!.addEventListener('click', () => {
      root.querySelector('button')!.textContent = String(++this.count);
    });
  }
}
customElements.define('agent-counter', AgentCounter);
console.log('agent boot');
`,
      },
      {
        name: 'package.json',
        content: '{"type":"module","dependencies":{}}',
        hidden: true,
      },
    ])
  ).toString('base64url');

async function callPlaygroundTool<Result = PlaygroundToolResult>(
  page: Page,
  name: string,
  input: Record<string, unknown> = {}
) {
  return page.evaluate(
    async ({name, input}) => {
      return window.playgroundTools.get(name)!.execute(input, {
        signal: new AbortController().signal,
      });
    },
    {name, input}
  ) as Promise<Result>;
}

test.describe('Playground WebMCP', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({page}) => {
    await preventGDPRBanner(page);
    // Test the real compiler and iframe without requiring native WebMCP support.
    await page.addInitScript(() => {
      window.playgroundTools = new Map();
      Object.defineProperty(document, 'modelContext', {
        configurable: true,
        value: {
          registerTool(
            tool: RegisteredPlaygroundTool,
            {signal}: {signal: AbortSignal}
          ) {
            window.playgroundTools.set(tool.name, tool);
            signal.addEventListener(
              'abort',
              () => {
                if (window.playgroundTools.get(tool.name) === tool) {
                  window.playgroundTools.delete(tool.name);
                }
              },
              {once: true}
            );
            return Promise.resolve();
          },
        },
      });
    });
    await page.goto(agentProjectUrl);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.playgroundTools.has('edit_files') &&
            document.querySelector<PlaygroundProject>('playground-project')
              ?.files?.length
        )
      )
      .toBeTruthy();
  });

  test('edits a batch, updates the editor, and returns compiler diagnostics', async ({
    page,
  }) => {
    await page.click('text=main.ts');
    const result = await callPlaygroundTool(page, 'edit_files', {
      changes: [
        {operation: 'create', path: 'scratch.txt', content: 'scratch'},
        {
          operation: 'patch',
          path: 'scratch.txt',
          oldText: 'scratch',
          newText: 'patched',
        },
        {operation: 'rename', path: 'scratch.txt', newPath: 'renamed.txt'},
        {operation: 'delete', path: 'renamed.txt'},
        {
          operation: 'patch',
          path: 'main.ts',
          oldText: 'agent boot',
          newText: 'agent updated',
        },
        {
          operation: 'create',
          path: 'type-error.ts',
          content: 'export const value: number = "wrong";',
        },
      ],
    });
    expect(result.applied).toBe(true);
    expect(result.status).toBe('compiled');
    expect(result.compiled).toBe(true);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({path: 'type-error.ts', code: 2322}),
      ])
    );
    await expect(
      page.locator('playground-code-editor .cm-content')
    ).toContainText('agent updated');
    const listing = await callPlaygroundTool<string>(page, 'read_file', {
      path: '.',
    });
    expect(listing.split('\n')).toEqual([
      'index.html',
      'main.ts',
      'package.json',
      'type-error.ts',
    ]);
    expect(
      await callPlaygroundTool<string>(page, 'read_file', {
        path: 'main.ts',
        startLine: 3,
        endLine: 3,
      })
    ).toBe('  count = 0;');
  });

  test('inspects shadow DOM, captures logs, and evaluates code', async ({
    page,
  }) => {
    const rebuild = await callPlaygroundTool(page, 'edit_files', {changes: []});
    expect(rebuild).toMatchObject({
      status: 'compiled',
      applied: false,
      diagnostics: [],
    });
    // Compilation can finish before the new iframe has connected.
    await callPlaygroundTool(page, 'get_runtime_logs');
    const script = page
      .frameLocator('playground-preview iframe')
      .locator('script[data-token]');
    const token = await script.getAttribute('data-token');
    await page.evaluate((token) => {
      // Vary one handshake field at a time so each guard is exercised.
      const iframe = document
        .querySelector('playground-preview')!
        .shadowRoot!.querySelector('iframe')!;
      const data = {type: 'litdev-preview-ready', token};
      window.dispatchEvent(
        new MessageEvent('message', {
          data,
          source: iframe.contentWindow,
          origin: 'https://untrusted.example',
          ports: [new MessageChannel().port2],
        })
      );
      window.dispatchEvent(
        new MessageEvent('message', {
          data,
          source: window,
          origin: new URL(iframe.src).origin,
          ports: [new MessageChannel().port2],
        })
      );
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {...data, token: 'wrong-token'},
          source: iframe.contentWindow,
          origin: new URL(iframe.src).origin,
          ports: [new MessageChannel().port2],
        })
      );
    }, token);
    const stringSelector = await callPlaygroundTool(page, 'inspect_preview', {
      selector: 'button',
    });
    expect(stringSelector.error).toContain(
      'Expected a nonempty array of CSS selectors'
    );
    const documentSearch = await callPlaygroundTool(page, 'inspect_preview', {
      selector: ['button'],
    });
    expect(documentSearch.error).toContain(
      'Selector step 1 (button) matched no element'
    );
    const missingRoot = await callPlaygroundTool(page, 'inspect_preview', {
      selector: ['agent-counter', 'button', 'span'],
    });
    expect(missingRoot.error).toContain(
      'Selector step 2 (button) has no open shadow root'
    );
    const inspected = await callPlaygroundTool(page, 'inspect_preview', {
      selector: ['agent-counter', 'button'],
      properties: ['textContent'],
      styles: ['display'],
    });
    expect(inspected.result?.element?.tag).toBe('button');
    expect(inspected.result?.properties?.textContent).toBe('0');
    expect(
      await page.evaluate(() => window.playgroundTools.has('evaluate_preview'))
    ).toBe(true);
    await expect(page.locator('#agent-evaluation')).toHaveCount(0);
    const evaluated = await callPlaygroundTool(page, 'evaluate_preview', {
      code: `const counter = document.querySelector('agent-counter');
        counter.shadowRoot.querySelector('button').click();
        return {count: counter.count};`,
    });
    expect(evaluated.result?.count).toBe(1);
    const timedOut = await callPlaygroundTool(page, 'evaluate_preview', {
      code: 'await new Promise((resolve) => setTimeout(resolve, 250)); return true;',
      timeoutMs: 10,
    });
    expect(timedOut.error).toContain('Preview request timed out');
    const logs = await callPlaygroundTool(page, 'get_runtime_logs');
    expect(logs.result?.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({message: 'inline startup'}),
        expect.objectContaining({message: 'agent boot'}),
      ])
    );
    await expect(
      page.frameLocator('playground-preview iframe').locator('head')
    ).toHaveAttribute('data-label', 'a > b');
    await callPlaygroundTool(page, 'evaluate_preview', {
      code: `for (let index = 0; index < 220; index++) console.log('x'.repeat(1000));`,
    });
    const boundedLogs = await callPlaygroundTool(page, 'get_runtime_logs');
    expect(boundedLogs.error).toBeUndefined();
    expect(boundedLogs.result?.entries?.length).toBeGreaterThan(0);
    await callPlaygroundTool(page, 'evaluate_preview', {
      code: `document.body.insertAdjacentHTML('beforeend', ('<p>' + 'x'.repeat(1000) + '</p>').repeat(90));`,
    });
    const largeSnapshot = await callPlaygroundTool(page, 'inspect_preview');
    expect(largeSnapshot.result).toMatchObject({
      truncated: true,
      element: {
        children: expect.arrayContaining([expect.objectContaining({tag: 'p'})]),
      },
    });
  });

  test('reconnects when the preview reloads without compiling', async ({
    page,
  }) => {
    const rebuild = await callPlaygroundTool(page, 'edit_files', {changes: []});
    expect(rebuild.status).toBe('compiled');
    await callPlaygroundTool(page, 'get_runtime_logs');
    const iframe = await page
      .locator('playground-preview iframe')
      .elementHandle();
    const frame = (await iframe!.contentFrame())!;
    await Promise.all([
      frame.waitForNavigation({waitUntil: 'load'}),
      frame.evaluate(() => location.reload()),
    ]);
    const inspected = await callPlaygroundTool(page, 'inspect_preview', {
      selector: ['agent-counter', 'button'],
    });
    expect(inspected.result?.element?.tag).toBe('button');
  });
});
