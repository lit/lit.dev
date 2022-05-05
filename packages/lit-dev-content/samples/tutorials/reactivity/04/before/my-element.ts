import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  name = '';

  @property()
  sha = '';

  setName(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
  }

  render() {
    return html`
      <label>Name: <input @input=${this.setName}></label>
      <p>You entered: ${this.name}</p>
      SHA: ${this.sha}`;
  }
}
