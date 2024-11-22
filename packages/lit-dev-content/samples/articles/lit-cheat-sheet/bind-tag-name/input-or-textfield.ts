import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { html as staticHTML, StaticValue } from 'lit/static-html.js';
import { live } from 'lit/directives/live.js';

@customElement('input-or-textfield')
export class MyElement extends LitElement {
  // attribute is false because this is a value that can't be serialized to an
  // HTML attribute
  @property({ attribute: false }) tagLiteral: StaticValue|null = null;
  @property() value = '';

  render() {
    return html`
      ${
        // NOTE: the live() directive prevents setting the .value property if
        // the live value of the input / textfield already matches this.value.
        // This is important since static html templates should not be thrashed
        // due to performance concerns.
        staticHTML`
          <${this.tagLiteral}
            @input=${this.#onInput}
            .value=${live(this.value)}></${this.tagLiteral}>
        `
      }
      <div>
        The value of the input is: ${this.value}
      </div>
    `;
  }

  #onInput(e: InputEvent) {
    this.value = (e.target as (HTMLInputElement | HTMLTextAreaElement)).value;
  }
}
