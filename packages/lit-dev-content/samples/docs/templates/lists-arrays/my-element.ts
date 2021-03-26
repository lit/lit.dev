/* playground-fold */
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
/* playground-fold-end */

@property() colors = ['red', 'green', 'blue'];

render() {
  return html`<p>Colors: ${this.colors}</p>`;
}
/* playground-fold */

}
/* playground-fold-end */
