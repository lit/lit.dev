import {LitElement, html, css} from 'lit';
import {customElement, property, state, query} from 'lit/decorators.js';

@customElement('mediator-element')
export class MediatorElement extends LitElement {
  static styles = css`
    :host {
      font-family: sans-serif;
    }
  `;

  @property()
  name = 'anonymous';
  @state()
  _submitEnabled = false;
  @query('input')
  _input!: HTMLInputElement;

  _inputChanged(e: Event) {
    this._submitEnabled = !!(e.target as HTMLInputElement).value;
  }

  _updateName() {
    this.name = this._input.value;
    this._input.value = '';
    this._submitEnabled = false;
  }

  render() {
    return html`<p>Nickname: ${this.name}</p>
        <label>Enter new nickname:
          <input @input=${this._inputChanged}>
        </label>
        <button @click=${this._updateName}
                .disabled=${!this._submitEnabled}>Submit</button>`;
  }
}
