import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  // TODO: Add `static styles` using the `css` tag function.

  @state() private idx = 0;
  @property() words = 'initial value';

  private intervalTimer?: number;
  
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

  tickToNextWord = () => { this.idx += 1; };
}

