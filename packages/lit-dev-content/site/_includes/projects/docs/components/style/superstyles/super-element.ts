import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element';

@customElement('super-element')
export class SuperElement extends LitElement {
  static styles = css`
    div {
      border: 1px solid gray;
      padding: 8px;
    }
  `;
  protected render() {
    return html`
      <div>Content</div>
    `;
  }
}
