import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {asyncReplace} from 'lit/directives/async-replace.js';

async function *countDown(count: number) {
  while (count > 0) {
    yield count--;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private timer = countDown(10);

  render() {
    return html`Timer: <span>${asyncReplace(this.timer)}</span>.`;
  }
}
