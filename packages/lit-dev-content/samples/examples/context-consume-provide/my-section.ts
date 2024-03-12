import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ContextProvider, ContextConsumer} from '@lit/context';
import {levelContext} from './level-context.js';

@customElement('my-section')
export class MySection extends LitElement {
  // Serve as a context provider with an initial value of 1.
  private _provider = new ContextProvider(this, {
    context: levelContext,
    initialValue: 1,
  });

  // Consumes level context from a parent provider. If a parent provider is
  // found, update own provider value to be 1 greater than provided value.
  private _consumer = new ContextConsumer(this, {
    context: levelContext,
    callback: (value) => {
      this._provider.setValue(value + 1);
    },
  });

  render() {
    return html`<section><slot></slot></section>`;
  }

  static styles = css`
    :host {
      display: block;
      border: 1px solid black;
      padding: 1rem;
    }
  `;
}
