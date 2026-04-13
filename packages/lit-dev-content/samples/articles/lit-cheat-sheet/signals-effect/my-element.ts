import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher, signal} from '@lit-labs/signals';
import {effect} from 'signal-utils/subtle/microtask-effect';

const count = signal(0);

@customElement('my-element')
export class MyElement extends SignalWatcher(LitElement) {
  @state() reactiveProp = 0;
  #disposeLoggerEffect = effect(() => {
    console.log('Do effect here!');
    console.log('The current count is:', count.get());
  });

  disconnectedCallback(): void {
    // Clean up the effect here, but similarly you can try settting up the
    // effect in the connectedCallback if this component is ever reconnected.
    super.disconnectedCallback();
    this.#disposeLoggerEffect();
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
