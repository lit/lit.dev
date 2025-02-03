import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher, computed, signal, watch} from '@lit-labs/signals';

const count = signal(0);

@customElement('my-element')
export class MyElement extends SignalWatcher(LitElement) {
  #doubleCount = computed(() => count.get() * 2);

  render() {
    console.log('render called');

    return html`
      <p>
        The count is ${watch(count)}. Double the count is
        ${watch(this.#doubleCount)}
      </p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}

