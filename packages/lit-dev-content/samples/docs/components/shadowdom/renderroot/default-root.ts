import { LitElement, html, customElement } from 'lit-element';

@customElement('default-root')
export class DefaultRoot extends LitElement {
  protected render() {
    return html`
      <p>By default template renders into shadow DOM.</p>
    `;
  }
}
