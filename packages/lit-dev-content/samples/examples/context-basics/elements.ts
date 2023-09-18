import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {provide, consume, createContext} from '@lit-labs/context';

import {providerStyles} from './styles.js';

const contextKey = Symbol('contextKey');
type ContextValue = string;
// Context object, which is the key for the context.
const context = createContext<ContextValue>(contextKey);

@customElement('provider-el')
export class ProviderEl extends LitElement {
  static styles = providerStyles;

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
  @consume({context})
  providedData = '';

  render() {
    return html` <h3>Consumer data: <code>${this.providedData}</code></h3> `;
  }
}
