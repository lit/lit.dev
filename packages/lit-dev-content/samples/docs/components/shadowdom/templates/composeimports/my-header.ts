import {LitElement, html, customElement} from 'lit-element';

@customElement('my-header')
class MyHeader extends LitElement {
  render() {
    return html`
      <header>header</header>
    `;
  }
}
