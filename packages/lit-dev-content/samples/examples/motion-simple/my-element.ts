import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {animate} from '@lit-labs/motion';

@customElement('my-element')
class MyElement extends LitElement {
  @property({type: Boolean}) shifted = false;
  static styles = css`
    .box {
      position: relative;
      background: steelblue;
      --box-size: 250px;
      height: var(--box-size);
      width: var(--box-size);
      border-radius: 50%;
    }

    .shifted {
      left: calc(100% - var(--box-size));
    }
  `;

  render() {
    return html`
      <p>
        <button @click=${() => (this.shifted = !this.shifted)}>Move</button>
      </p>
      <p class="box ${classMap({shifted: this.shifted})}" ${animate()}></p>
    `;
  }
}
