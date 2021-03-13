import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators';

@customElement('update-properties')
class UpdateProperties extends LitElement {

  @property()
  message: string = 'Loading';

  constructor() {
    super();
    this.addEventListener('stuff-loaded', (e) => { this.message = e.detail } );
    this.loadStuff();
  }

  render() {
    return html`
      <p>${this.message}</p>
    `;
  }

  loadStuff() {
    setInterval(() => {
      let loaded = new CustomEvent('stuff-loaded', {
        detail: 'Loading complete.'
      });
      this.dispatchEvent(loaded);
    }, 3000);
  }
}
