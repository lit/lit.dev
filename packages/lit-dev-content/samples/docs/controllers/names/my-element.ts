import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {NamesController} from './names-controller.js';
import * as Names from './names-api.js';

@customElement('my-element')
export class MyElement extends LitElement {
  private names = new NamesController(this);

  render() {
    return html`
      <h3>Names List</h3>
      Kind: <select @change=${this._kindChange}>
      ${this.names.kinds.map(
        (k) => html`<option value=${k}>${k}</option>`)
      }
    </select>
    ${this.names.render({
      complete: (result: Names.Result) => html`
        <p>List of ${this.names.kind}</p>
        <ul>${result.map(i => html`<li>${i.name}</li>`)}
        </ul>
      `,
      initial: () => html`<p>Select a kind...</p>`,
      pending: () => html`<p>Loading ${this.names.kind}...</p>`,
      error: (e: any) => html`<p>${e}</p>`
    })}`;
  }

  private _kindChange(e: Event) {
    this.names.kind = (e.target as HTMLSelectElement).value as Names.Kind;
  }
}
