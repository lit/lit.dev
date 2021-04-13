import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {NamesController, NamesResult, Kind} from './names-controller.js';

@customElement('my-element')
export class MyElement extends LitElement {
  private namesController = new NamesController(this);

  render() {
    return html`
      <h3>Names List</h3>
      Kind: <select @change=${(e: Event) =>
        this.namesController.kind =
          (e.target! as HTMLSelectElement).value as Kind
      }>
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
      initial: () => html`<p>Select a kind...</p>`,
      pending: () => html`<p>Loading ${this.namesController.kind}...</p>`,
      error: (e: any) => html`<p>Error: ${e}</p>`
    })}`;
  }
}
