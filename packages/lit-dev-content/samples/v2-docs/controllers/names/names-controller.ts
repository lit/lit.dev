import {ReactiveControllerHost} from 'lit';
import {initialState, StatusRenderer, Task} from '@lit-labs/task';
import * as Names from './names-api.js';

export class NamesController {
  host: ReactiveControllerHost;
  value?: string[];
  readonly kinds = Names.kinds;
  private task!: Task<[Names.Kind], Names.Result>;
  private _kind: Names.Kind = '';

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.task = new Task<[Names.Kind], Names.Result>(host,
      async ([kind]: [Names.Kind]) => {
        if (!kind?.trim()) {
          return initialState;
        }
        try {
          const response = await fetch(`${Names.baseUrl}${kind}`);
          const data = await response.json();
          return data.results as Names.Result;
        } catch {
          throw new Error(`Failed to fetch "${kind}"`);
        }
      }, () => [this.kind]
    );
  }

  set kind(value: Names.Kind) {
    this._kind = value;
    this.host.requestUpdate();
  }
  get kind() { return this._kind; }

  render(renderFunctions: StatusRenderer<Names.Result>) {
    return this.task.render(renderFunctions);
  }
}
