import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element';
import { styleMap } from 'lit/directives/style-map';

export const styles = {
  'background-color': 'whitesmoke',
  fontFamily: 'Roboto',
  '--custom-color': '#e26dd2',
  '--otherColor': '#77e26d'
};
@customElement('my-element')
export class MyElement extends LitElement {
  protected render() {
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
