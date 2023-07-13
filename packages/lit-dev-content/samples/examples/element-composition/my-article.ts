import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-article')
class MyArticle extends LitElement {
  static styles =
    css`
      article {
        padding: 20px;
        font-family: 'Open Sans', sans-serif;
      }
    `
  render() {
    return html`
      <article>
        <p>
          Manage complexity by building large, complex components
          out of smaller, simpler components that do one thing well.
        </p>
      </article>
    `;
  }
}
