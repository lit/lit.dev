import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('name-tag')
class NameTag extends LitElement {
  @property()
  name: string = 'Your name here';

  render() {
    return html`
      <p>Hello, ${this.name}</p>
      // TODO add input element
    `;
  }

  // TODO add event handler
}
