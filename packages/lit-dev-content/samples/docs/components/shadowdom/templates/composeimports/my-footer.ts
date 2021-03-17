import {LitElement, html, customElement} from 'lit-element';

@customElement('my-footer')
class MyFooter extends LitElement {
  render() {
    return html`
      <footer>footer</footer>
    `;
  }
}
