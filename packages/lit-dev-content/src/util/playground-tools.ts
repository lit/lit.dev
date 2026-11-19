import type {
  FilesChangedEvent,
  PlaygroundProject,
} from 'playground-elements/playground-project.js';
import type {PlaygroundPreview} from 'playground-elements/playground-preview.js';

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  execute: (
    input: Record<string, unknown>,
    options: {signal: AbortSignal}
  ) => Promise<unknown>;
}

interface ModelContext {
  registerTool(tool: Tool, options: {signal: AbortSignal}): Promise<void>;
}

interface Options {
  project: PlaygroundProject;
  preview: PlaygroundPreview;
  bridgeUrl: string;
  markUnsaved: () => void;
}

interface BuildState {
  token: string;
  buildInput: string;
  compiled: boolean;
  diagnostics: object[];
  error?: string;
}

interface PreviewConnection {
  port: MessagePort;
  loaded: boolean;
}

type FileChange =
  | {operation: 'create' | 'replace'; path: string; content: string}
  | {operation: 'delete'; path: string}
  | {operation: 'rename'; path: string; newPath: string};

export interface PreviewRequest {
  id: number;
  action: 'inspect' | 'evaluate' | 'logs';
  input: Record<string, unknown>;
}

export interface PreviewReply {
  type: 'loaded' | 'unloaded' | 'result';
  id?: number;
  result?: unknown;
  error?: string;
}

export function connectPlaygroundTools(
  options: Options
): (() => void) | undefined {
  const context = (document as Document & {modelContext?: ModelContext})
    .modelContext;
  if (!context) {
    return undefined;
  }
  const tools = new PlaygroundTools(context, options);
  return () => tools.disconnect();
}

class PlaygroundTools {
  private readonly _lifetime = new AbortController();
  private readonly _changes = new EventTarget();
  private _buildState?: BuildState;
  private _connection?: PreviewConnection;
  private _lastRequestId = 0;
  private readonly _requests = new Map<
    number,
    {
      resolve: (result: unknown) => void;
      reject: (error: Error) => void;
      cleanup: () => void;
    }
  >();
  private readonly _previousTransform;

  constructor(
    private readonly _context: ModelContext,
    private readonly _options: Options
  ) {
    const {project} = _options;
    const {signal} = this._lifetime;
    this._previousTransform = project.previewHtmlTransform;
    project.previewHtmlTransform = this._transformHtml;
    project.addEventListener(
      'filesChanged',
      (event) => {
        if (!(event as FilesChangedEvent).projectLoaded) {
          _options.markUnsaved();
        }
      },
      {signal}
    );
    project.addEventListener('compileStart', () => this._onCompileStart(), {
      signal,
    });
    project.addEventListener('compileDone', () => this._onCompileDone(), {
      signal,
    });
    window.addEventListener('message', this._onMessage, {signal});
    this._registerTools();
  }

  disconnect() {
    this._lifetime.abort();
    this._closeConnection();
    this._options.project.previewHtmlTransform = this._previousTransform;
    this._buildState = undefined;
    this._notify();
  }

  private _registerTools() {
    this._registerTool(
      'read_file',
      'Read raw project file text, or pass "." to list all project file paths, one per line. File line numbers are one-based and inclusive.',
      {
        path: {
          type: 'string',
          description: 'Exact project file path or "." to list files.',
        },
        startLine: {type: 'integer', minimum: 1},
        endLine: {type: 'integer', minimum: 1},
      },
      ['path'],
      async (input) => this._readFile(input)
    );

    this._registerTool(
      'edit_files',
      'Apply edits, rebuild, and return compiler diagnostics without waiting for the preview to load. Edits are kept even if compilation reports errors. Pass an empty array to rebuild without editing.',
      {
        changes: {
          type: 'array',
          items: {
            oneOf: [
              getEditSchema('create', {content: {type: 'string'}}, ['content']),
              getEditSchema('replace', {content: {type: 'string'}}, [
                'content',
              ]),
              getEditSchema(
                'patch',
                {
                  oldText: {type: 'string', minLength: 1},
                  newText: {type: 'string'},
                },
                ['oldText', 'newText']
              ),
              getEditSchema('rename', {newPath: {type: 'string'}}, ['newPath']),
              getEditSchema('delete', {}, []),
            ],
          },
        },
      },
      ['changes'],
      async (input, signal) => {
        const {project} = this._options;
        const changes = parseFileChanges(project.files!, input.changes);
        const applied = changes.length > 0;
        const result = await this._build(() => {
          for (const change of changes) {
            switch (change.operation) {
              case 'create':
                project.addFile(change.path);
                project.editFile(
                  project.files!.find(({name}) => name === change.path)!,
                  change.content
                );
                break;
              case 'replace':
                project.editFile(
                  project.files!.find(({name}) => name === change.path)!,
                  change.content
                );
                break;
              case 'delete':
                project.deleteFile(change.path);
                break;
              case 'rename':
                project.renameFile(change.path, change.newPath);
                break;
            }
          }
          if (applied) {
            this._options.markUnsaved();
          }
          return project.save();
        }, signal);
        return {...result, applied};
      }
    );

    this._registerTool(
      'inspect_preview',
      'Inspect DOM, including element bounds, properties, and computed styles.',
      {
        selector: {
          type: 'array',
          minItems: 1,
          items: {type: 'string', minLength: 1},
          description:
            'CSS selector path starting in the document. Each subsequent selector searches the previous match\'s open shadow root, e.g. ["my-widget", "button"]. Defaults to ["body"].',
        },
        depth: {type: 'integer', minimum: 0, maximum: 5},
        properties: {type: 'array', items: {type: 'string'}, maxItems: 20},
        styles: {type: 'array', items: {type: 'string'}, maxItems: 20},
      },
      [],
      (input, signal) => this._request('inspect', input, signal)
    );

    this._registerTool(
      'get_runtime_logs',
      'Read bounded console messages, runtime errors, and unhandled rejections captured in the current preview.',
      {
        clear: {type: 'boolean'},
      },
      [],
      (input, signal) => this._request('logs', input, signal)
    );

    this._registerTool(
      'evaluate_preview',
      'Execute an async JavaScript function body only in the current preview and return its serialized value. Can change runtime state and make network requests. Reload does not undo storage or external effects.',
      {
        code: {type: 'string'},
        timeoutMs: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_TIMEOUT_MS,
          description:
            'Milliseconds to wait for the evaluation reply after the preview is ready. Defaults to 10000. Does not stop running code.',
        },
      },
      ['code'],
      async (input, signal) => {
        const {code, timeoutMs} = input;
        if (typeof code !== 'string') {
          throw new Error('Expected a JavaScript function body');
        }
        if (
          timeoutMs !== undefined &&
          (typeof timeoutMs !== 'number' ||
            !Number.isInteger(timeoutMs) ||
            timeoutMs < 1 ||
            timeoutMs > MAX_TIMEOUT_MS)
        ) {
          throw new Error(
            `timeoutMs must be an integer from 1 to ${MAX_TIMEOUT_MS}`
          );
        }
        return this._request('evaluate', {code}, signal, timeoutMs);
      }
    );
  }

  private _registerTool(
    name: string,
    description: string,
    properties: object,
    required: string[],
    execute: (
      input: Record<string, unknown>,
      signal: AbortSignal
    ) => Promise<unknown>
  ) {
    const lifetime = this._lifetime;
    void Promise.resolve(
      this._context.registerTool(
        {
          name,
          description,
          inputSchema: {
            type: 'object',
            properties,
            required,
            additionalProperties: false,
          },
          execute: async (input, options) => {
            const invocation = new AbortController();
            const signals = options?.signal
              ? [options.signal, lifetime.signal]
              : [lifetime.signal];
            const cancel = () => invocation.abort();
            for (const signal of signals) {
              signal.addEventListener('abort', cancel, {once: true});
              if (signal.aborted) {
                cancel();
              }
            }
            try {
              if (invocation.signal.aborted) {
                throw new Error('Tool execution cancelled');
              }
              if (!this._options.project.files) {
                throw new Error('Project is still loading');
              }
              // TODO: Report which files the user changed between agent tool calls.
              return await execute(input, invocation.signal);
            } catch (error) {
              return {error: errorMessage(error)};
            } finally {
              for (const signal of signals) {
                signal.removeEventListener('abort', cancel);
              }
            }
          },
        },
        {signal: lifetime.signal}
      )
    ).catch((error: unknown) => {
      lifetime.abort();
      console.warn('Could not register playground tools', error);
    });
  }

  private _readFile(input: Record<string, unknown>) {
    const files = this._options.project.files!;
    if (input.path === '.') {
      return files.map(({name}) => name).join('\n');
    }
    const file = files.find(({name}) => name === input.path);
    if (!file) {
      throw new Error(`File not found: ${input.path}`);
    }
    if (input.startLine === undefined && input.endLine === undefined) {
      return file.content;
    }
    const lines = file.content.split('\n');
    const start =
      input.startLine === undefined ? 1 : positiveInteger(input.startLine);
    const end =
      input.endLine === undefined
        ? lines.length
        : positiveInteger(input.endLine);
    if (start > end || start > lines.length || end > lines.length) {
      throw new Error(`Line range must be within 1-${lines.length}`);
    }
    return lines.slice(start - 1, end).join('\n');
  }

  private _onCompileStart() {
    const {project} = this._options;
    this._closeConnection();
    this._buildState = {
      token: crypto.randomUUID(),
      buildInput: JSON.stringify([
        project.config,
        project.cdnBaseUrl,
        project.sandboxBaseUrl,
      ]),
      compiled: false,
      diagnostics: [],
    };
    this._notify();
  }

  private _onCompileDone() {
    if (this._buildState) {
      this._buildState.compiled = true;
      this._buildState.diagnostics = [
        ...(this._options.project.diagnostics ?? []),
      ].flatMap(([path, diagnostics]) =>
        diagnostics.map((diagnostic) => ({
          ...diagnostic,
          path,
          range: {
            start: {
              line: diagnostic.range.start.line + 1,
              column: diagnostic.range.start.character + 1,
            },
            end: {
              line: diagnostic.range.end.line + 1,
              column: diagnostic.range.end.character + 1,
            },
          },
        }))
      );
      this._notify();
    }
  }

  private async _build(start: () => Promise<void>, signal: AbortSignal) {
    const build = this._startBuild(start);
    const completed = await this._waitForBuild(build, signal, 'compile');
    return {
      status: completed.status,
      compiled: completed.build.compiled,
      previewReady: completed.connection?.loaded === true,
      diagnostics: completed.build.diagnostics,
      error: completed.build.error,
    };
  }

  private _startBuild(start: () => Promise<void>) {
    const saving = start();
    // save() dispatches compileStart event synchronously. Its promise can also
    // resolve when compilation is canceled, so ready state comes from events.
    const build = this._buildState!;
    void saving.catch((error: unknown) => {
      build.error = errorMessage(error);
      this._notify();
    });
    return build;
  }

  private _waitForBuild(
    build: BuildState,
    signal: AbortSignal,
    waitFor: 'compile' | 'preview'
  ): Promise<{
    status: string;
    build: BuildState;
    connection?: PreviewConnection;
  }> {
    return new Promise((resolve, reject) => {
      const finish = (status: string, connection?: PreviewConnection) => {
        cleanup();
        resolve({status, build, connection});
      };
      const check = () => {
        const currentBuild = this._buildState;
        const connection = this._connection;
        if (
          !currentBuild ||
          (waitFor === 'compile'
            ? currentBuild.buildInput !== build.buildInput
            : currentBuild !== build)
        ) {
          finish('superseded');
        } else {
          build = currentBuild;
          if (build.error) {
            finish('error');
          } else if (build.compiled && waitFor === 'compile') {
            // Preview entry won't be attached if project has no index.html
            finish('compiled', connection);
          } else if (build.compiled && connection?.loaded) {
            finish('ready', connection);
          }
        }
      };
      const cancel = () => {
        cleanup();
        reject(new Error('Tool execution cancelled'));
      };
      const timer = window.setTimeout(() => finish('timeout'), 60000);
      const cleanup = () => {
        clearTimeout(timer);
        this._changes.removeEventListener('change', check);
        signal.removeEventListener('abort', cancel);
      };
      this._changes.addEventListener('change', check);
      signal.addEventListener('abort', cancel, {once: true});
      if (signal.aborted) {
        cancel();
      } else {
        check();
      }
    });
  }

  private _transformHtml = (source: string) => {
    source = this._previousTransform?.(source) ?? source;
    const build = this._buildState;
    if (!build) {
      return source;
    }
    const offset = previewScriptOffset(source);
    const script = document.createElement('script');
    script.src = this._options.bridgeUrl;
    script.dataset.token = build.token;
    script.dataset.parentOrigin = location.origin;
    return source.slice(0, offset) + script.outerHTML + source.slice(offset);
  };

  private _onMessage = (event: MessageEvent) => {
    const build = this._buildState;
    const {project, preview} = this._options;
    const port = event.ports[0];
    // The iframe window can survive navigation; the token ties the handshake
    // to the current build as well as the expected window and origin.
    if (
      !build ||
      !project.baseUrl ||
      event.source !== preview.iframe?.contentWindow ||
      event.origin !== new URL(project.baseUrl).origin ||
      event.data?.type !== 'litdev-preview-ready' ||
      event.data.token !== build.token ||
      !port
    ) {
      return;
    }
    this._closeConnection();
    const connection: PreviewConnection = {port, loaded: false};
    this._connection = connection;
    port.onmessage = ({data}: MessageEvent<PreviewReply>) => {
      if (this._connection !== connection) {
        return;
      }
      if (data.type === 'loaded') {
        connection.loaded = true;
        this._notify();
      } else if (data.type === 'unloaded') {
        this._closeConnection();
        this._notify();
      } else if (data.type === 'result' && data.id !== undefined) {
        const request = this._requests.get(data.id);
        if (request) {
          request.cleanup();
          if (data.error) {
            request.reject(new Error(data.error));
          } else {
            request.resolve({result: data.result});
          }
        }
      }
    };
    port.start();
    this._notify();
  };

  private async _request(
    action: PreviewRequest['action'],
    input: Record<string, unknown>,
    signal: AbortSignal,
    timeoutMs = 10000
  ) {
    const build =
      this._buildState ?? this._startBuild(() => this._options.project.save());
    const {connection} = await this._waitForBuild(build, signal, 'preview');
    if (!connection) {
      throw new Error('Preview is not ready');
    }
    if (signal.aborted || this._connection !== connection) {
      throw new Error('Preview request cancelled');
    }
    return new Promise((resolve, reject) => {
      const id = ++this._lastRequestId;
      const cancel = () => {
        cleanup();
        reject(new Error('Preview request cancelled'));
      };
      const timer = window.setTimeout(() => {
        cleanup();
        reject(
          new Error(
            'Preview request timed out. Consider re-running if page is in a loop.'
          )
        );
      }, timeoutMs);
      const cleanup = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
        this._requests.delete(id);
      };
      this._requests.set(id, {resolve, reject, cleanup});
      signal.addEventListener('abort', cancel, {once: true});
      connection.port.postMessage({id, action, input} as PreviewRequest);
    });
  }

  private _closeConnection() {
    this._connection?.port.close();
    this._connection = undefined;
    for (const request of this._requests.values()) {
      request.cleanup();
      request.reject(new Error('Preview was reloaded or disconnected'));
    }
  }

  private _notify() {
    this._changes.dispatchEvent(new Event('change'));
  }
}

function previewScriptOffset(source: string): number {
  // Insert script tag at the start of head, ignoring commented out head
  const prefix =
    /[\t\n\f\r ]+|<!--(?:>|->|[\s\S]*?--!?>)|(?:<!doctype(?=[\t\n\f\r >])|<(html|head)(?=[\t\n\f\r />]))(?:[^<>"']|"[^"]*"|'[^']*')*>/iy;
  let offset = source.charCodeAt(0) === 0xfeff ? 1 : 0;
  prefix.lastIndex = offset;
  let match: RegExpExecArray | null;
  while ((match = prefix.exec(source))) {
    offset = prefix.lastIndex;
    if (match[1]?.toLowerCase() === 'head') {
      break;
    }
  }
  return offset;
}

function parseFileChanges(
  files: readonly {name: string; content: string}[],
  input: unknown
): FileChange[] {
  if (!Array.isArray(input)) {
    throw new Error('Expected an array of file changes');
  }
  // Validate batch of edits as one transaction.
  const contents = new Map(files.map(({name, content}) => [name, content]));
  return input.map((change: unknown): FileChange => {
    if (!change || typeof change !== 'object') {
      throw new Error('Expected a file change object');
    }
    const {operation, path, content, newPath, oldText, newText} =
      change as Record<string, unknown>;
    validateFilePath(path);
    if (operation === 'create') {
      if (contents.has(path)) {
        throw new Error(`File already exists: ${path}`);
      }
      if (typeof content !== 'string') {
        throw new Error(`Expected file content: ${path}`);
      }
      contents.set(path, content);
      return {operation, path, content};
    }
    if (!contents.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    switch (operation) {
      case 'replace':
        if (typeof content !== 'string') {
          throw new Error(`Expected file content: ${path}`);
        }
        contents.set(path, content);
        return {operation, path, content};
      case 'patch': {
        if (
          typeof oldText !== 'string' ||
          !oldText ||
          typeof newText !== 'string'
        ) {
          throw new Error(
            `Expected nonempty oldText and string newText: ${path}`
          );
        }
        const previous = contents.get(path)!;
        const start = previous.indexOf(oldText);
        let matchCount = 0;
        // Error on ambiguous or failed patch matches.
        for (
          let match = start;
          match !== -1;
          match = previous.indexOf(oldText, match + 1)
        ) {
          matchCount++;
        }
        if (matchCount !== 1) {
          throw new Error(
            `Patch must match exactly once: ${path} (found ${matchCount}). Read the current file before retrying.`
          );
        }
        const patched =
          previous.slice(0, start) +
          newText +
          previous.slice(start + oldText.length);
        contents.set(path, patched);
        return {operation: 'replace', path, content: patched};
      }
      case 'delete':
        contents.delete(path);
        return {operation, path};
      case 'rename':
        validateFilePath(newPath);
        if (contents.has(newPath)) {
          throw new Error(`File already exists: ${newPath}`);
        }
        contents.set(newPath, contents.get(path)!);
        contents.delete(path);
        return {operation, path, newPath};
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  });
}

function validateFilePath(name: unknown): asserts name is string {
  if (
    typeof name !== 'string' ||
    !name ||
    /[\\?#\x00-\x1f]/.test(name) ||
    name.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error(`Invalid file path: ${name}`);
  }
}

function getEditSchema(
  operation: string,
  properties: object,
  required: string[]
) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      operation: {const: operation},
      path: {type: 'string'},
      ...properties,
    },
    required: ['operation', 'path', ...required],
  };
}

function positiveInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error('Expected a positive integer line number');
  }
  return value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
