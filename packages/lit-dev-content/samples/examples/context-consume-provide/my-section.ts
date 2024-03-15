import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ContextProvider, ContextConsumer} from '@lit/context';
import {levelContext} from './level-context.js';

const COLORS = ['blue', 'orange', 'green', 'purple'];

@customElement('my-section')
export class MySection extends LitElement {
  // Serve as a context provider with an initial level 1 and the color for that
  // level
  private _provider = new ContextProvider(this, {
    context: levelContext,
    initialValue: {level: 0, color: COLORS[0]},
  });

  // Consumes level context from a parent provider. If a parent provider is
  // found, update own provider level to be 1 greater than provided value and
  // its corresponding color.
  private _consumer = new ContextConsumer(this, {
    context: levelContext,
    callback: ({level}) => {
      this._provider.setValue({
        level: level + 1,
        color: COLORS[(level + 1) % COLORS.length],
      });
    },
  });

  render() {
    return html`<section><slot></slot></section>`;
  }

  static styles = css`
    :host {
      display: block;
      text-align: center;
    }
  `;
}
