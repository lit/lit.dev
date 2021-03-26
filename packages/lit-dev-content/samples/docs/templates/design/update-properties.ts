import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('update-properties')
class UpdateProperties extends LitElement {

  @property()
  message: string = 'Loading...';

  constructor() {
    super();
    this.loadStuff().then((content) => this.message = content);
  }

  render() {
    return html`
      <p>${this.message}</p>
    `;
  }

  loadStuff() {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve('Content loaded.');
      }, 3000);
    });
  }
}
