import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ContextProvider, ContextConsumer} from '@lit/context';
import {levelContext} from './level-context.js';

@customElement('my-section')
export class MySection extends LitElement {
  // Serve as a context provider with an initial level 1 and numbering prefix
  // based on its numbering among siblings.
  private _provider = new ContextProvider(this, {
    context: levelContext,
    initialValue: {
      level: 1,
      prefix: String(this._siblingNumber) + '.',
    },
  });

  // Consumes level context from a parent provider. If a parent provider is
  // found, update own provider level to be 1 greater than provided value and
  // append its sibling number.
  private _consumer = new ContextConsumer(this, {
    context: levelContext,
    callback: ({level, prefix}) => {
      this._provider.setValue({
        level: level + 1,
        prefix: prefix + String(this._siblingNumber) + '.',
      });
    },
  });

  private get _siblingNumber() {
    return (
      Array.from(this.parentNode!.children)
        .filter((el) => el instanceof MySection)
        .indexOf(this) + 1
    );
  }

  render() {
    return html`<section><slot></slot></section>`;
  }

  static styles = css`
    :host {
      display: block;
      margin-left: 1rem;
    }
  `;
}
