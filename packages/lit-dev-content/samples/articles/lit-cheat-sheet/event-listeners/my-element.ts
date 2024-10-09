import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() inputValue = '';
  @state() hasError = false;
  @query('input') inputEl!: HTMLInputElement;

  render() {
    return html`
      <!-- custom events -->
      <div
          @number-error=${this.onNumberError}
          @number-success=${this.onNumberSuccess}>
        <!-- native events -->
        <input @input=${this.onInput} .value=${this.inputValue} />
        <button @click=${this.onClick}>Clear</button>
        ${this.hasError ? html`<b>Only positive numbers are allowed</b>` : ''}
        <div>${this.inputValue}</div>
      </div>
    `;
  }

  onInput(e: InputEvent) {
    this.inputValue = (e.target as HTMLInputElement).value;
    if (!this.inputValue.match(/^[0-9]+$/)) {
      this.inputEl.dispatchEvent(new Event('number-error', {bubbles: true}));
      return;
    }

    this.inputEl.dispatchEvent(new Event('number-success', {bubbles: true}));
  }

  onClick() {
    this.inputValue = '';
    this.inputEl.focus();
  }

  onNumberError() {
    this.hasError = true;
  }

  onNumberSuccess() {
    this.hasError = false;
  }
}