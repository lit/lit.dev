import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher, watch, signal} from '@lit-labs/signals';

// This signal is shared between all instances of the component
const count = signal(0);

@customElement('shared-counter')
export class SharedCounterComponent extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      border: solid 1px lightgray;
      margin: 8px;
      padding: 8px;
    }

    button {
      background: lightgreen
    }
  `;

  render() {
    return html`
      <slot></slot>
      <p>count = ${watch(count)}</p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}
