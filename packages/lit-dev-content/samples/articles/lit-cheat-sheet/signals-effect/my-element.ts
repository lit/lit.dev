import {LitElement, PropertyValues, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
// NOTE: `html` is imported from the `@lit-labs/signals` package.
import {SignalWatcher, signal} from '@lit-labs/signals';

const count = signal(0);

@customElement('my-element')
export class MyElement extends SignalWatcher(LitElement) {
  #lastCount = count.get();
  @state() reactiveProp = 0;

  protected willUpdate(): void {
    // The `count` signal will not be included in the `PropertyValues` map
    // often passed into `update`, `updated`, and `willUpdate` lifecycle
    // methods, so we need to manually check if the value has changed.
    if (count.get() !== this.#lastCount) {
        this.#lastCount = count.get();
        console.log('Do effect here!');
        console.log('The current count is:', count.get());
    }
  }

  render() {
    return html`
      <p>
        The count is: ${count.get()}
        <button @click=${this.#onClick}>Increment</button>
      </p>
      <p>
        Try changing this reactive property: ${this.reactiveProp}
        <button @click=${() => this.reactiveProp++}>Increment</button>
      </p>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}
