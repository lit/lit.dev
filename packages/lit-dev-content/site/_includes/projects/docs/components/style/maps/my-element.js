import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';

class MyElement extends LitElement {
  static properties = {
    classes: { type: Object },
    styles: { type: Object }
  };
  static styles = css`
    .someclass { border: 1px solid red; padding: 4px; }
    .anotherclass { background-color: navy; }
  `;
  constructor() {
    super();
    this.classes = { someclass: true, anotherclass: true };
    this.styles = { color: 'lightgreen', fontFamily: 'Roboto' };
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
