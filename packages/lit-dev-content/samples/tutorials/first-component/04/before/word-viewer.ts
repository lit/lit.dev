import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  @state() private idx = 0;
  @property() words = 'initial value';

  // TODO: Define a `connectedCallback` which sets an interval.
  // TODO: Define a `disconnectedCallback` which clears the interval.  

  render() {
    const splitWords = this.words.split('.');
    const word = splitWords[this.idx % splitWords.length];
    return html`<pre>${word}</pre>`;
  }

  // TODO: Define `tickToNextWord`.
}

