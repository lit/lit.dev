import { LitElement, html } from "lit-element";

class MyHeader extends LitElement {
  static properties = {
    title: {}
  };
  constructor() {
    super();
    this.title = "default header";
  }
  render() {
    return html`
      <header>${this.title}</header>
      <hr />
    `;
  }
}
customElements.define("my-header", MyHeader);
