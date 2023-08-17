import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-header')
class MyHeader extends LitElement {
  render() {
    return html`
      <header>header</header>
    `;
  }
}
