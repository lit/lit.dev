import {LitElement, css, html} from 'lit-element';

export class SideNavElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render () {
    return html`<slot></slot>`;
  }
}
customElements.define('side-nav', SideNavElement);
