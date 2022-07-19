import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('counter-button')
class CounterButton extends LitElement {
  @property({ type: String }) count = 0;

  render() {
    return html`
      <button>click count: ${this.count}</button>
    `;
  }
}

export { CounterButton };
