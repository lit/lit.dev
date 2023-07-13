import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

@customElement('my-element')
export class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = true;

  @property({type: Boolean})
  hidden = false;

  render() {
    const styles = {
      backgroundColor: this.enabled ? 'lightgreen' : 'transparent',
      opacity: this.hidden ? '0.2' : '1',
      padding: '10px'
    };
    return html`
      <h3>styleMap directive example</h3>

      <p style=${styleMap(styles)}>Hello style!</p>
      <hr>
      <label>
        <input type="checkbox" .checked=${this.enabled} @change=${this.toggleEnabled}>
        Enabled
      </label>
      <label>
        <input type="checkbox" .checked=${this.hidden} @change=${this.toggleHidden}>
        Hidden
      </label>
    `;
  }

  private toggleEnabled() {
    this.enabled = !this.enabled;
  }

  private toggleHidden() {
    this.hidden = !this.hidden;
  }
}
