import {html, LitElement, css} from 'lit';
import {
  customElement,
  property,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';

@customElement('my-pretty-input')
export class MyPrettyInput extends LitElement {
  @state() inputFocused = false;
  @queryAssignedElements({selector: 'input'}) inputs!: Array<HTMLInputElement>;
  #lastInput: HTMLInputElement | null = null;

  render() {
    return html`
      <div>
        <slot @slotchange=${this.#onSlotchange}></slot>
        <span>The input is ${this.inputFocused ? '' : 'not'} focused</span>
      </div>
    `;
  }

  #onSlotchange() {
    // get the array of assigned elements and pick the first one
    const firstInput = this.inputs[0];

    if (firstInput !== this.#lastInput) {
      this.#clearListeners();
    }

    if (!firstInput) {
      return;
    }

    this.#lastInput = firstInput;

    this.#attachListeners(firstInput);
  }

  #attachListeners(input: HTMLInputElement) {
    input.addEventListener('focus', this.#onInputFocus);
    input.addEventListener('blur', this.#onInputBlur);
  }

  #onInputFocus = () => {
    this.inputFocused = true;
    // get the array of assigned elements and pick the first one
    const input = this.inputs[0];

    input?.animate?.(
      [
        {transform: 'scale(1)', easing: 'ease-out'},
        {transform: 'scale(2)', easing: 'ease-in'},
        {transform: 'scale(1)'},
      ],
      1000,
    );
  };

  #onInputBlur = () => {
    this.inputFocused = false;
    const input = this.inputs[0];

    input?.animate?.(
      [
        {transform: 'scale(1)', easing: 'ease-out'},
        {transform: 'scale(.75)', easing: 'ease-in'},
        {transform: 'scale(1)'},
      ],
      1000,
    );
  };

  #clearListeners() {
    if (this.#lastInput) {
      this.#lastInput.removeEventListener('focus', this.#onInputFocus);
      this.#lastInput.removeEventListener('blur', this.#onInputBlur);
    }

    this.#lastInput = null;
  }

  static styles = css`
    /* playground-fold */
    canvas {
      border: 1px solid black;
    }

    label {
      display: block;
      margin-block-start: 1em;
    }
    /* playground-fold-end */
  `;
}
