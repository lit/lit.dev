import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {NamesController, Kind, NamesResult} from './names-controller.js';

@customElement('my-element')
export class MyElement extends LitElement {
  private namesController = new NamesController(this);

  render() {
    return html`Kind: <select @change=${this._kindChange}>
      ${this.namesController.kinds.map(
        (k) => html`<option value=${k}>${k}</option>`)
      }
    </select>
    ${this.namesController.render({
      complete: (result: NamesResult) => {
        return html`
          <p>List of ${this.namesController.kind}</p>
          <ul>${result.map(i => html`<li>${i.value}</li>`)}
          </ul>
        `;
      },
      initial: () => html`<p>Choose a kind of names...</p>`,
      pending: () => html`<p>Loading...</p>`,
      error: (e: any) => html`<p>Error: ${e}</p>`
    })}`;
  }

  private _kindChange(e: Event) {
   this.namesController.kind = (e.target! as HTMLSelectElement).value as Kind;
   this.requestUpdate();
  }
}
