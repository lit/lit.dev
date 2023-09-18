import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {provide, consume, createContext} from '@lit-labs/context';

import {providerStyles} from './styles.js';

const contextKey = Symbol('contextKey');
// The value type for the context.
type ContextValue = string;
// Context object, which acts like a key for the context.
const context = createContext<ContextValue>(contextKey);

@customElement('provider-el')
export class ProviderEl extends LitElement {
  static styles = providerStyles;

  /**
   * `data` will be provided to any consumer that is in the DOM tree below it.
   */
  @provide({context})
  @property()
  data = 'Initial';

  render() {
    return html`
      <h3>Provider's data: <code>${this.data}</code></h3>
      <slot></slot>
    `;
  }
}

@customElement('consumer-el')
export class ConsumerEl extends LitElement {
  /**
   * `providedData` will be populated by the first ancestor element which
   * provides a value for `context`.
   */
  @consume({context})
  providedData = '';

  render() {
    return html` <h3>Consumer data: <code>${this.providedData}</code></h3> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'provider-el': ProviderEl;
    'consumer-el': ConsumerEl;
  }
}
