import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';

class MyElement extends LitElement {
  static properties = {
    classes: { type: Object },
    styles: { type: Object }
  };
  static styles = css`
    .mydiv { background-color: blue; }
    .someclass { border: 1px solid red; }
  `;
  constructor() {
    super();
    this.classes = { mydiv: true, someclass: true };
    this.styles = { color: 'green', fontFamily: 'Roboto' };
  }
  render() {
    return html`
      <div class=${classMap(this.classes)} style=${styleMap(this.styles)}>
        Some content
      </div>
    `;
  }
}
customElements.define('my-element', MyElement);
