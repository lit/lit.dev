import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property()
  name: string = '';

  render() {
    return html` <p>Welcome to the ${this.name} tutorial.</p> `;
  }
}
