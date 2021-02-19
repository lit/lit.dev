import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {asyncReplace} from 'lit/directives/async-replace.js';

async function *timeNow() {
  let i = 0;
  while (true) {
    yield new Date().toString();
    await new Promise((r) => setTimeout(r, 1000));
  }
};

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private time = timeNow();

  render() {
    return html`
      <h3>asyncRepeat directive example</h3>
      Time now: <span>${asyncReplace(this.time)}</span>.
    `;
  }
}
