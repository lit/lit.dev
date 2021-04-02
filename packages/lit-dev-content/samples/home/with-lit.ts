import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('with-lit')
export class WithLit extends LitElement {
  static styles = css`:host {
    font-family: sans-serif;
    border: 1px dotted #333; }`;

  @property()
  action = '@Build';

  render() {
    return html`<figure>${this.action}WithLit</figure>`;
  }
}