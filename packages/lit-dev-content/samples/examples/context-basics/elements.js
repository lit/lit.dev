import {html, LitElement} from 'lit';
import {ContextProvider, ContextConsumer, createContext} from '@lit/context';

import {providerStyles} from './styles.js';

const contextKey = Symbol('contextKey');

// Context object, which acts like a key for the context.
// The context object acts as a key. A consumer will only receive
// values from a provider if their contexts match. A Symbol ensures
// that this context will be unique.
const context = createContext(contextKey);

export class ProviderEl extends LitElement {
  static styles = providerStyles;

  static properties = {
    data: {},
  };

  constructor() {
    super();
    this._provider = new ContextProvider(this, {context});
    this.data = 'Initial';
  }

  /**
   * `data` will be provided to any consumer that is in the DOM tree below it.
   */
  set data(value) {
    this._data = value;
    this._provider.setValue(value);
  }

  get data() {
    return this._data;
  }

  render() {
    return html`
      <h3>Provider's data: <code>${this.data}</code></h3>
      <slot></slot>
    `;
  }
}
customElements.define('provider-el', ProviderEl);

export class ConsumerEl extends LitElement {
  _consumer = new ContextConsumer(this, {context});

  /**
   * `providedData` will be populated by the first ancestor element which
   * provides a value for `context`.
   */
  get providedData() {
    return this._consumer.value;
  }

  render() {
    return html`<h3>Consumer data: <code>${this.providedData}</code></h3>`;
  }
}
customElements.define('consumer-el', ConsumerEl);
