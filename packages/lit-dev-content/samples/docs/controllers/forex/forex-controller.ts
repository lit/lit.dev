import {ReactiveController, ReactiveControllerHost} from 'lit';
import { initialState, StatusRenderer, Task } from './task.js';

interface ForexResult {
  rates: {[currency: string]: number};
  base: string;
  date: string;
}

interface ForexError {
  error: string;
}

export class ForexController implements ReactiveController {
  private host: ReactiveControllerHost;
  private _currency: string = '';
  private task!: Task;

  get currency() { return this._currency; }
  set currency(v: string) {
    this._currency = v;
    this.task.hostUpdated();
  }

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
    this.task = new Task<[string], ForexResult>(this.host,
      async ([currency]: [string]) => {
        if (currency == null || currency.trim() === '') {
          return initialState;
        }
        const response = await fetch(getExchangeUrl(currency));
        const result = await response.json() as ForexResult | ForexError;
        const error = (result as ForexError).error;
        if (error !== undefined) {
          throw new Error(error);
        }
        return result as ForexResult;
      },
      () => [this._currency]
    );
  }

  render(renderFunctions: StatusRenderer<ForexResult>) {
    return this.task.render(renderFunctions);
  }

  hostConnected() {
  }

  hostDisconnected() {
  }

}

const getExchangeUrl = (name: string) => `https://api.exchangeratesapi.io/latest?base=USD&symbols=${name}`;
