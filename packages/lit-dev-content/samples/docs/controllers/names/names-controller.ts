import {ReactiveControllerHost} from 'lit';
import {initialState, StatusRenderer, Task} from '@lit-labs/task';

export class NamesController {
  host: ReactiveControllerHost;
  value?: string[];
  readonly kinds = ['', 'cities', 'countries', 'states', 'streets', 'error'] as const;
  private task!: Task;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.task = new Task<[Kind], NamesResult>(host,
      async ([kind]: [Kind]) => {
        if (!kind?.trim()) {
          return initialState;
        }
        const response = await fetch(`${baseUrl}${kindUrlMap[kind]}`);
        const result = await response.json() as NamesResult | NamesError;
        const error = (result as NamesError).error;
        if (error !== undefined) {
          throw new Error(error);
        }
        return result as NamesResult;
      },
      () => [this.kind]
    );
  }

  private _kind: Kind = '';
  set kind(value: Kind) {
    this._kind = value;
    this.host.requestUpdate();
  }

  get kind() {
    return this._kind;
  }

  render(renderFunctions: StatusRenderer<NamesResult>) {
    return this.task.render(renderFunctions);
  }
}

export interface NamesError {
  error: string;
}
export type NamesResult = Array<{value: string}>;
export type Kind = typeof NamesController.prototype.kinds[number];

const baseUrl = 'https://next.json-generator.com/api/json/get/';
const kindUrlMap = {
  '': '',
  'cities': 'VyfXnFpH5',
  'countries': 'Vk0bnY6B9',
  'states': '4J5N3tTH9',
  'streets': 'NybqntTr5',
  // Inserted to demo an error state.
  'error': ''
}
