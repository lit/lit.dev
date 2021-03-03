import { LitElement, html } from "lit-element";

class MyArticle extends LitElement {
  static properties = {
    text: {}
  };
  constructor() {
    super();
    this.text = "default text";
  }
  render() {
    return html`
      <article>${this.text}</article>
    `;
  }
}
customElements.define("my-article", MyArticle);
