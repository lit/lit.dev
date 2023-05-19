/* playground-fold */
import {LitElement, html} from 'lit';

class MyElement extends LitElement {
/* playground-fold-end */

static properties = {
  colors: {},
};

constructor() {
  super();
  this.colors = ['red', 'green', 'blue'];
}

render() {
  return html`
    <ul>
      ${this.colors.map((color) =>
        html`<li style="color: ${color}">${color}</li>`
      )}
    </ul>
  `;
}
/* playground-fold */

}
customElements.define('my-element', MyElement);
/* playground-fold-end */
