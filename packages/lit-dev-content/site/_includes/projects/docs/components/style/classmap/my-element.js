import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

class MyElement extends LitElement {
  static styles = css`
    .alert {
      padding: 16px;
      background-color: whitesmoke;
    }
    .info {
      color: blue;
    }
  `;
  render() {
    return html`
      <div class=${classMap({alert:true,info:true})}>Content.</div>
    `;
  }
}
customElements.define('my-element', MyElement);
