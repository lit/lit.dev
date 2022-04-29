import {LitElement, html} from 'lit';

class MyElement extends LitElement {
  result = '';

  flipCoin() {
    if (Math.random() < 0.5) {
      this.result = 'Heads';
    } else {
      this.result = 'Tails';
    }
  }

  render() {
    return html`
    <button @click=${this.flipCoin}>Flip a coin!</button>
    <p>Result: ${this.result}</p>

    `;
  }
}
customElements.define('my-element', MyElement);
