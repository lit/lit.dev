import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
// NOTE: `html` is imported from the `@lit-labs/signals` package.
import {SignalWatcher, signal, html} from '@lit-labs/signals';

const count = signal(0);

@customElement('my-element')
export class MyElement extends SignalWatcher(LitElement) {
  render() {
    console.log('render called');

    return html`
      <!--
        No need for the 'watch()' directive with the @lit-labs/signals html tag
        import
      -->
      <p>The count is ${count}</p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}
