import {LitElement, html} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import {guard} from 'lit/directives/guard.js';
import {calculateSHA} from './calculate-sha.js';

@customElement('my-element')
export class MyElement extends LitElement {

  @state()
  private value: string = 'test string';

  @state()
  private counter: number = 0;

  @query('input#value')
  private input!: HTMLInputElement;

  render() {
    return html`
      <h3>guard directive example</h3>

      <input id="value" .value=${this.value}>
      <button @click=${this.updateValue}>Calculate</button><br>

      The SHA for '${this.value}' is:
      <div>${guard([this.value], () => calculateSHA(this.value))}</div>
      <hr>

      Incrementing the counter does not recalculate SHA:<br>
      <button @click=${this.incrementCounter}>Increment: ${this.counter}</button>
    `;
  }

  private updateValue() {
    this.value = this.input.value;
  }

  private incrementCounter() {
    this.counter++;
  }
}
