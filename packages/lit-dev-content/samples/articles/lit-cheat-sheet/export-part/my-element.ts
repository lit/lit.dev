import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './another-element.js';

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`<another-element exportparts="part-1, part-2:part-b"></another-element>`;
  }
}