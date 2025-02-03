import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() inputValue = '';
  @query('input') inputEl!: HTMLInputElement;

  render() {
    return html`
      <div>
        <input @input=${this.onInput} .value=${this.inputValue} />
        <button @click=${this.onClick}>Clear</button>

        <div>${this.inputValue}</div>
      </div>
    `;
  }

  onInput(e: Event) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  onClick() {
    this.inputValue = '';
    this.inputEl.focus();
  }
}
