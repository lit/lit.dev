import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

function computeSHA(string: string) {
  const utf8array = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8array).then((outBuffer) => {
    return Array.from(new Uint8Array(outBuffer))
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
  });
}

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
      <label>Name: <input @change=${this.setName}></label>
      <p>Name: ${this.name}</p>
      SHA: ${this.sha}`;
  }
}
