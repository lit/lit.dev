import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {computeSHA} from './compute-sha.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  name = '';

  @property()
  sha = '';

  willUpdate(changedProperties: PropertyValues<this>) {
    // Only need to check changed properties for an expensive computation.
    if (changedProperties.has('name')) {
      computeSHA(this.name).then((sha) => this.sha = sha);
    }
  }

  setName(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
  }

  render() {
    return html`
      <label>Name: <input @input=${this.setName}></label>
      <p>You entered: ${this.name}</p>
      SHA: ${this.sha}`;
  }
}
