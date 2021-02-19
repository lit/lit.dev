import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {asyncAppend} from 'lit/directives/async-replace.js';

async function *tossCoins() {
  while (true) {
    yield Math.random() > 0.5 ? 'Heads' : 'Tails';
  }
};

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private tosses = tossCoins();

  render() {
    return html`
      <h3>asyncAppend directive example</h3>
      <ul>${asyncAppend(this.tosses, (v: string) => html`<li>${v}</li>`)}</ul>`;
  }
}
