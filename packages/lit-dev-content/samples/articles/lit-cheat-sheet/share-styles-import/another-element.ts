import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import {sharedStyles} from './shared-styles.js';

@customElement('another-element')
export class AnotherElement extends LitElement {
  static styles = sharedStyles

  render() {
    return html`
      This <code>&ltcode></code> element shares styles with the <code>&ltmy-element></code> element.
    `;
  }
}