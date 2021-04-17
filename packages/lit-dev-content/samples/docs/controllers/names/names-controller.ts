import {ReactiveControllerHost} from 'lit';
import {initialState, StatusRenderer, Task} from '@lit-labs/task';
import * as Names from './names-api.js';

export class NamesController {
  host: ReactiveControllerHost;
  value?: string[];
  readonly kinds = Names.kinds;
  private task!: Task;
  private _kind: Names.Kind = '';

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.task = new Task<[Names.Kind], Names.Result>(host,
      async ([kind]: [Names.Kind]) => {
        if (!kind?.trim()) {
          return initialState;
        }
        const response = await fetch(`${Names.baseUrl}${Names.kindIdMap[kind]}`);
        const result = await response.json();
        const error = (result as Names.Error).error;
        if (error !== undefined) {
          throw new Error(error);
        }
        return result as Names.Result;
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