(() => {
  type Request = import('../util/playground-tools.js').PreviewRequest;
  type Reply = import('../util/playground-tools.js').PreviewReply;
  const script = document.currentScript as HTMLScriptElement;
  const {token, parentOrigin} = script.dataset;
  if (!token || !parentOrigin || parent === window) {
    return;
  }
  const {port1: port, port2: parentPort} = new MessageChannel();
  const maxResultLength = 65536;
  const logs: Array<{sequence: number; level: string; message: string}> = [];
  let sequence = 0;

  function log(level: string, values: unknown[]) {
    const message = values
      .map((value) => {
        try {
          return typeof value === 'string' ? value : serialize(value);
        } catch {
          return String(value);
        }
      })
      .join(' ')
      .slice(0, 4000);
    logs.push({sequence: ++sequence, level, message});
    // Leave room for reply metadata and account for JSON escaping in messages.
    while (logs.length > 200 || JSON.stringify(logs).length > 48000) {
      logs.shift();
    }
  }

  for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    const original = console[level].bind(console);
    console[level] = (...values: unknown[]) => {
      log(level, values);
      original(...values);
    };
  }
  window.addEventListener('error', (nativeEvent: Event) => {
    const event = nativeEvent as ErrorEvent;
    log('error', [
      event.message,
      event.filename,
      event.lineno,
      event.error?.stack,
    ]);
  });
  window.addEventListener('unhandledrejection', (event) => {
    log('unhandledrejection', [event.reason]);
  });

  port.onmessage = async ({data}: MessageEvent<Request>) => {
    try {
      let result: unknown;
      switch (data.action) {
        case 'logs':
          result = {entries: [...logs], lastSequence: sequence};
          if (data.input.clear === true) {
            logs.length = 0;
          }
          break;
        case 'inspect':
          result = inspect(data.input);
          break;
        case 'evaluate': {
          const AsyncFunction = Object.getPrototypeOf(async () => {})
            .constructor as new (body: string) => () => Promise<unknown>;
          result = await new AsyncFunction(String(data.input.code))();
          break;
        }
        default:
          throw new Error('Unknown preview action');
      }
      port.postMessage({
        type: 'result',
        id: data.id,
        result: JSON.parse(serialize(result)),
      } as Reply);
    } catch (error) {
      port.postMessage({
        type: 'result',
        id: data.id,
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error),
      } as Reply);
    }
  };
  port.start();
  parent.postMessage({type: 'litdev-preview-ready', token}, parentOrigin, [
    parentPort,
  ]);
  const loaded = () => port.postMessage({type: 'loaded'} as Reply);
  if (document.readyState === 'complete') {
    loaded();
  } else {
    window.addEventListener('load', loaded, {once: true});
  }
  window.addEventListener(
    'pagehide',
    () => {
      port.postMessage({type: 'unloaded'} as Reply);
      port.close();
    },
    {once: true}
  );

  function inspect(input: Record<string, unknown>) {
    const element = selectElement(
      input.selector === undefined ? ['body'] : input.selector
    );
    const depth = input.depth === undefined ? 2 : input.depth;
    if (
      typeof depth !== 'number' ||
      !Number.isInteger(depth) ||
      depth < 0 ||
      depth > 5
    ) {
      throw new Error('Inspection depth must be an integer from 0 to 5');
    }
    const properties = stringList(input.properties);
    const styles = stringList(input.styles);
    const computed = getComputedStyle(element);
    const metadata = serialize({
      element: null,
      properties: Object.fromEntries(
        properties.map((name) => [
          name,
          (element as unknown as Record<string, unknown>)[name],
        ])
      ),
      styles: Object.fromEntries(
        styles.map((name) => [name, computed.getPropertyValue(name)])
      ),
      truncated: false,
    });
    // Reserve room for properties and styles before spending the rest on nodes.
    let remainingSize = maxResultLength - metadata.length + 'null'.length;
    let remainingNodes = 200;
    let truncated = false;
    const snapshot = (node: Element, depthLeft: number): object | undefined => {
      const {x, y, width, height} = node.getBoundingClientRect();
      const shadow = depthLeft > 0 ? node.shadowRoot : null;
      const summary = {
        tag: node.localName,
        attributes: Object.fromEntries(
          [...node.attributes].map(({name, value}) => [name, value])
        ),
        text: node.textContent?.slice(0, 1000),
        bounds: {x, y, width, height},
        children: [] as object[],
        shadowRoot: shadow ? ([] as object[]) : undefined,
      };
      // Budget for the node alone and a potential separator in its parent array.
      let size = JSON.stringify(summary).length + 1;
      if (node === element && size > remainingSize) {
        truncated = true;
        summary.attributes = {};
        size = JSON.stringify(summary).length + 1;
      }
      if (remainingNodes === 0 || size > remainingSize) {
        truncated = true;
        return;
      }
      remainingNodes--;
      remainingSize -= size;
      const append = (nodes: HTMLCollection, target: object[]) => {
        for (const child of nodes) {
          const item = snapshot(child, depthLeft - 1);
          if (!item) {
            break;
          }
          target.push(item);
        }
      };
      if (depthLeft > 0) {
        append(node.children, summary.children);
      }
      if (shadow) {
        append(shadow.children, summary.shadowRoot!);
      }
      return summary;
    };
    return {
      ...JSON.parse(metadata),
      element: snapshot(element, depth) ?? null,
      truncated,
    };
  }

  function selectElement(selectors: unknown): Element {
    if (
      !Array.isArray(selectors) ||
      !selectors.length ||
      selectors.some(
        (selector) => typeof selector !== 'string' || !selector.trim()
      )
    ) {
      throw new Error('Expected a nonempty array of CSS selectors');
    }
    let root: Document | ShadowRoot = document;
    let element!: Element;
    for (const [index, selector] of selectors.entries()) {
      const step = `Selector step ${index + 1} (${selector})`;
      const match = root.querySelector(selector);
      if (!match) {
        throw new Error(`${step} matched no element`);
      }
      element = match;
      if (index < selectors.length - 1) {
        if (!element.shadowRoot) {
          throw new Error(`${step} has no open shadow root`);
        }
        root = element.shadowRoot;
      }
    }
    return element;
  }

  function stringList(value: unknown): string[] {
    if (value === undefined) {
      return [];
    }
    if (
      !Array.isArray(value) ||
      value.length > 20 ||
      value.some((entry) => typeof entry !== 'string')
    ) {
      throw new Error('Expected at most 20 property or style names');
    }
    return value;
  }

  function serialize(value: unknown): string {
    const seen = new WeakSet<object>();
    const json = JSON.stringify(value, (_key, entry: unknown) => {
      if (
        typeof entry === 'bigint' ||
        typeof entry === 'function' ||
        typeof entry === 'symbol'
      ) {
        return String(entry);
      }
      if (entry instanceof Element) {
        return {
          tag: entry.localName,
          id: entry.id,
          text: entry.textContent?.slice(0, 1000),
        };
      }
      if (entry instanceof Error) {
        return {name: entry.name, message: entry.message, stack: entry.stack};
      }
      if (entry !== null && typeof entry === 'object') {
        if (seen.has(entry)) {
          return '[Circular]';
        }
        seen.add(entry);
      }
      return entry;
    });
    if (json !== undefined && json.length > maxResultLength) {
      throw new Error('Preview result exceeds 64 KiB; return a smaller result');
    }
    return json ?? 'null';
  }
})();
