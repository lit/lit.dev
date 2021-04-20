import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('my-page')
class MyPage extends LitElement {

  @property({attribute: false})
  article = {
    title: 'Template composition',
    text: `Defining partial templates as instance methods
           can break the template into manageable pieces—and
           allow a subclass to override individual parts of the template.`
  };

  headerTemplate() {
    return html`<header><h1>${this.article.title}</h1></header>`;
  }

  articleTemplate() {
    return html`<article>${this.article.text}</article>`;
  }

  render() {
    return html`
      ${this.headerTemplate()}
      ${this.articleTemplate()}
    `;
  }
}
