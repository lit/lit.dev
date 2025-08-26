import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {html as staticHTML, StaticValue} from 'lit/static-html.js';

@customElement('input-or-textfield')
export class MyElement extends LitElement {
  // attribute is false because this is a value that can't be serialized to an
  // HTML attribute
  @property({attribute: false}) tagLiteral: StaticValue | null = null;
  @property() value = '';

  render() {
    return html`
      ${staticHTML`
          <${this.tagLiteral}
            @input=${this.#onInput}
            .value=${this.value}></${this.tagLiteral}>
        `}
      <div>The value of the input is: ${this.value}</div>
    `;
  }

  #onInput(e: InputEvent) {
    this.value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
  }
}
