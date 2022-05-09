import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  @state() private idx = 0;
  @property() words = 'initial value';

  render() {
    const splitWords = this.words.split('.');
    const word = splitWords[this.idx % splitWords.length];
    return html`<pre>${word}</pre>`;
  }
}

