import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() private count = 0;

  get doubleCount() {
    return this.count * 2;
  }

  render() {
    return html`
      <p>Count: ${this.count}</p>
      <p>Double count: ${this.doubleCount}</p>
      <button @click=${this.#increment}>Increment</button>
    `;
  }

  #increment() {
    this.count++;
  }
}
