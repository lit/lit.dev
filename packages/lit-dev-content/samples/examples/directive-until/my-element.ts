import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {until} from 'lit/directives/until.js';

const fetchData = async () => {
  await new Promise<void>((r) => setTimeout(() => r(), 2000));
  return 'Lorem Ipsum';
};

@customElement('my-element')
class MyElement extends LitElement {
  @state()
  private content: Promise<string> = fetchData();

  render() {
    return html`
      <h3>until directive example</h3>
      ${until(this.content, html`<span>Loading...</span>`)}
    `;
  }
}
