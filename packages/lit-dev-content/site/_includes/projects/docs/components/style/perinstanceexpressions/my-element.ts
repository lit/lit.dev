import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element';
import { property } from 'lit/decorators/property';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    div {
      margin: 8px;
    }
  `;
  @property()
  red = false;
  _toggleColor() {
    this.red = !this.red;
  }
  protected render() {
    const blueText = html`
      <style> :host { color: blue; } </style>
    `;
    const redText = html`
      <style> :host { color: red; } </style>
    `;
    return html`
      <button @click=${this._toggleColor}>Toggle color</button>
      ${this.red ? redText : blueText}
      <div>Hello World</div>
    `;
  }
}
