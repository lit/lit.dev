import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { literal } from 'lit/static-html.js';
import './input-or-textfield.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() tagLiteral = literal`input`;
  render() {
    return html`
      <!-- /* playground-fold */ -->
      <fieldset>
        <legend>Choose a tag to render:</legend>
        <div>
          <label>
            <input
                type="radio"
                name="selection"
                @change=${this.#onChange}
                value="input"
                checked>
            input
          </label>
        </div>
        <div>
          <label>
            <input
                type="radio"
                name="selection"
                @change=${this.#onChange}
                value="textarea">
            textarea
          </label>
        </div>
      </fieldset>
      <!-- /* playground-fold-end */ -->
      <input-or-textfield
          value="this is the default value"
          .tagLiteral=${this.tagLiteral}>
      </input-or-textfield>
    `;
  }

  #onChange(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.tagLiteral = target.value === 'input' ? literal`input` : literal`textarea`;
  }

  static styles = css`/* playground-fold */:host { font-family: sans-serif; } :host > * { margin-block: .5em; }/* playground-fold-end */`;
}
