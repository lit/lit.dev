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
  return html`<p>Colors: ${this.colors}</p>`;
}
/* playground-fold */

}
customElements.define('my-element', MyElement);
/* playground-fold-end */
