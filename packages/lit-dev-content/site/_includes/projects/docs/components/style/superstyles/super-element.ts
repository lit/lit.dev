import { LitElement, html, css, customElement } from 'lit-element';

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
