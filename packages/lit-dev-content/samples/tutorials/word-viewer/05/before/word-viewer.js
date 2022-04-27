import {css, html, LitElement} from 'lit';

class WordViewer extends LitElement {
  static properties = {
    idx: {state: true},
    words: {},
  };
  // TODO: Add `static styles` using the `css` tag function.

  constructor() {
    super();
    this.idx = 0;
    this.words = 'initial value';
  }

  intervalTimer;

  connectedCallback() {
    super.connectedCallback();
    this.intervalTimer = setInterval(this.tickToNextWord, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.intervalTimer);
    this.intervalTimer = undefined;
  }

  render() {
    const splitWords = this.words.split('.');
    const word = splitWords[this.idx % splitWords.length];
    return html`<pre>${word}</pre>`;
  }

  tickToNextWord = () => {
    this.idx += 1;
  };
}
customElements.define('word-viewer', WordViewer);
