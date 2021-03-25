import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

function headerTemplate(title: string) {
  return html`<header>${title}</header>`;
}
function articleTemplate(text: string) {
  return html`<article>${text}</article>`;
}
function footerTemplate() {
  return html`<footer>Your footer here.</footer>`;
}

@customElement('my-page')
class MyPage extends LitElement {

  @property({attribute: false})
  article = {
    title: 'My Nifty Article',
    text: 'Some witty text.',
  };

  render() {
    return html`
      ${headerTemplate(this.article.title)}
      ${articleTemplate(this.article.text)}
      ${footerTemplate()}
    `;
  }
}
