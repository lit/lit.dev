import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import {sharedStyles} from './shared-styles.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = [sharedStyles, css`
    p code {
      background-color: #faff00;
    }
  `]

  render() {
    return html`
      This <code>&ltcode></code> element shares styles with the <code>&ltanother-element></code> element.
      <p>I am overriding the <code>&ltcode></code> element in this <code>&ltp></code> tag.</p>
    `;
  }
}