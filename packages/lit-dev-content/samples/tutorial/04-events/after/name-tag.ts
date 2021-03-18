import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators';

@customElement('name-tag')
class NameTag extends LitElement {
  @property()
  name: string = 'Your name here';

  render() {
    return html`
      <p>Hello, ${this.name}</p>
      <input @change=${this.changeName} placeholder="Enter your name">
    `;
  }

  changeName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name = input.value;
    input.value = '';
  }
}
