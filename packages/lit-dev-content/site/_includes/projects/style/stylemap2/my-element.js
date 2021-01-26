import { styleMap } from 'lit-html/directives/style-map';
import { LitElement, html } from 'lit-element';

export const styles = {
  'background-color': 'whitesmoke',
  fontFamily: 'Roboto',
  '--custom-color': '#e26dd2',
  '--otherColor': '#77e26d'
};

export class MyElement extends LitElement {
  render() {
    return html`
    <div style=${styleMap(styles)}>
      <p>Styled with styleMap</p>
      <p style=${styleMap({
        color: 'var(--custom-color)'
      })}>A paragraph using <code>--custom-color</code></p>
      <p style=${styleMap({
        color: 'var(--otherColor)'
      })}>A paragraph using <code>--otherColor</code></p>
    </div>`;
  }
}
customElements.define('my-element', MyElement);
