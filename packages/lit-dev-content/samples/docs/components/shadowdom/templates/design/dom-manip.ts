import {LitElement, html, customElement} from 'lit-element';

// Anti-pattern. Avoid!
@customElement('dom-manip')
class DomManip extends LitElement {
  constructor() {
    super();
    this.addEventListener('stuff-loaded', (e) => {
      this.shadowRoot.getElementById('message').innerHTML = e.detail;
    });
    this.loadStuff();
  }
  render() {
    return html`
      <p id="message">Loading</p>
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
