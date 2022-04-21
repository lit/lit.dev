import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  static styles = css`
    :host {
      background-color: white;
      color: violet;
      cursor: pointer;
      display: block;
    }
    pre {
      padding: 0.2em;
    }
  `;

  @state() private playDirection = 1;
  @state() private idx = 0;
  @property() words: string = 'initial value';

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
    const word = splitWords[((this.idx % splitWords.length) + splitWords.length) % splitWords.length];
    return html`<pre
      @click=${this.switchPlayDirection}
    >${word}</pre>`;
  }

  tickToNextWord = () => { this.idx += this.playDirection; };

  switchPlayDirection() {
    this.playDirection *= -1;
  }
}

