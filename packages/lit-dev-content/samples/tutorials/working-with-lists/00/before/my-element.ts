import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({type: Array})
  names = ['Chandler', 'Phoebe', 'Joey', 'Monica', 'Rachel', 'Ross'];

  render() {
    return html`
      <p>A list of my friends</p>
      <ul>
        <!-- TODO: Replace with mapped templates. -->
        ${this.names}
      </ul>
    `;
  }
}
