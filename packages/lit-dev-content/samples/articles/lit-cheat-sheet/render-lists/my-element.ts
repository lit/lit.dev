import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

@customElement('my-element')
export class MyElement extends LitElement {
  names = ['Chandler', 'Phoebe', 'Joey', 'Monica', 'Rachel', 'Ross'];
  items = new Set(['Apple', 'Banana', 'Grape', 'Orange', 'Lime'])

  render() {
    return html`
      <p>A list of names that include the letter "e" (rendering an Array)</p>
      <ul>
      ${this.names
        .filter((name) => name.match(/e/i))
        .map((name) => html`<li>${name}</li>`)}
      </ul>

      <p>My unique fruits (rendering a Set)</p>
      <ul>
        ${map(this.items, (item) => html`<li>${item}</li>`)}
      </ul>
    `;
  }
}
