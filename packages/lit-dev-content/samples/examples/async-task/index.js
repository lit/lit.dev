import { LitElement, css, html } from 'lit';
import './npm-info.js';

export class DemoElement extends LitElement {
  static properties = {
    package: String,
  };

  constructor() {
    super();
    this.package = 'lit-element';
  }

  render() {
    return html`
      <label>Enter a package name:
        <input .value=${this.package} @change=${this._onChange}>
      </label>
      <npm-info package=${this.package}></npm-info>
    `;
  }

  _onChange(e) {
    this.package = e.target.value;
  }
}
customElements.define('demo-element', DemoElement);
