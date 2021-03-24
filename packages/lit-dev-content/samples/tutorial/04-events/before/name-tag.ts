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

  changeName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name = input.value;
    input.value = '';
  }
}
