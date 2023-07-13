import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property() forward = '';
  @property() backward = '';

  onInput(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    if (inputEl.id === 'forward') {
      this.forward = inputEl.value;
    } else {
      this.backward = inputEl.value;
    }
  }

  render() {
    return html`
      <label>Forward: <input id="forward" @input=${this.onInput} .value=${this.forward}></label>
      <label>Backward: <input id="backward" @input=${this.onInput} .value=${this.backward}></label>
      <div>Forward text: ${this.forward}</div>
      <div>Backward text: ${this.backward}</div>
    `;
  }
}
