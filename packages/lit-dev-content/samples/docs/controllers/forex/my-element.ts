import {LitElement, html} from 'lit';
import {query, customElement} from 'lit/decorators.js';
import {ForexController} from './forex-controller.js';

@customElement('my-element')
class MyElement extends LitElement {
  private forex = new ForexController(this);

  @query('input')
  private _input!: HTMLInputElement;

  render() {
    return html`
      <label>Get current rate in USD:
        <input .value=${this.forex.currency} @input=${this._onInput}/>
      </label>
      <div>
      ${this.forex.render({
        complete: (result) => {
          const [currency, inUSD] = [...Object.entries(result.rates)][0];
          return html`
            <h3>${currency}</h3>
            <p>1 ${currency} = ${inUSD} USD as of ${result.date}</p>
          `;
        },
        initial: () => `Enter a currency symbol like EUR or GBP...`,
        pending: () => `Loading...`,
        error: (e) => `Error: ${e}`
      })}
    </div>
    `;
  }

  _onInput() {
    this.forex.currency = this._input.value;
  }
}
