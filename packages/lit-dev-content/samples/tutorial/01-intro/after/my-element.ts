import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators';

@customElement('my-element')
class MyElement extends LitElement {
  @property()
  name: string = 'Lit';

  render() {
    return html`
    <p>Welcome to the ${name} tutorial.</p>
    `;
  }
}

