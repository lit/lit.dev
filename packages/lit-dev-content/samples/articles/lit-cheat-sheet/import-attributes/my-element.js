import { html, LitElement } from 'lit';
import styles from './styles.css' with { type: 'css' };

export class MyElement extends LitElement {
  static styles = styles;

  render() {
    return html`
      <div>
        This should be red!
      </div>
    `;
  }
}

customElements.define('my-element', MyElement);
