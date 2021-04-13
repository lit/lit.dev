import {ReactiveControllerHost} from 'lit';
import {initialState, StatusRenderer, Task} from '@lit-labs/task';

interface NamesError {
  error: string;
}
export type NamesResult = Array<{value: string}>;
export const kinds = ['', 'cities', 'countries', 'states', 'streets', 'error'] as const;
export type Kind = typeof kinds[number];

export class NamesController {
  private task!: Task;
  host: ReactiveControllerHost;
  kinds = kinds;
  _kind: Kind = '';
  value?: string[];
  baseUrl = 'https://next.json-generator.com/api/json/get/';
  kindUrlMap = {
    '': '',
    'cities': 'VyfXnFpH5',
    'countries': 'Vk0bnY6B9',
    'states': '4J5N3tTH9',
    'streets': 'NybqntTr5',
    // Inserted to demo an error state.
    'error': ''
  }

  set kind(value: Kind) {
    this._kind = value;
    this.host.requestUpdate();
  }

  get kind() {
    return this._kind;
  }

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.task = new Task<[Kind], NamesResult>(host,
      async ([kind]: [Kind]) => {
        if (kind == null || kind.trim() === '') {
          return initialState;
        }
        const response = await fetch(`${this.baseUrl}${this.kindUrlMap[kind]}`);
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

  render(renderFunctions: StatusRenderer<NamesResult>) {
    return this.task.render(renderFunctions);
  }
}
