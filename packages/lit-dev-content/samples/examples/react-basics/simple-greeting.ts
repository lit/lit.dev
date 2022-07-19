import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('simple-greeting')
class SimpleGreeting extends LitElement {
  @property()
  name = 'Somebody';

  render() {
    return html`Good morning, ${this.name}!`;
  }
}

export { SimpleGreeting };
