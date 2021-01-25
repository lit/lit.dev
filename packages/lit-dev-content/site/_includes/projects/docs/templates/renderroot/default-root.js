import { LitElement, html } from 'lit-element';

class DefaultRoot extends LitElement {
  render(){
    return html`
      <p><b>Default render root.</b> Template renders in shadow DOM.</p>
    `;
  }
}
customElements.define('default-root', DefaultRoot);
