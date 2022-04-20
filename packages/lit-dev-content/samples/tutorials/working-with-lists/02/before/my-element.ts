import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({type: Array})
  names = ['Chandler', 'Phoebe', 'Joey', 'Monica', 'Rachel', 'Ross'];

  render() {
    return html`
      <p>A list of names that include the letter "e"</p>
      <ul>
        <!-- TODO: Render list items of filtered names. -->
      </ul>
    `;
  }
}
