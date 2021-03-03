import {LitElement, html} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private data = {value: 'test'};

  @query('input#value')
  private input!: HTMLInputElement;

  render() {

    return html`
      <h3>live directive example</h3>

      Set this value to the inputs below.<br>
      <input id="value" .value=${this.data.value}>
      <button @click=${this.commitValue}>Commit</button><hr>

      With live: will update if out of sync with last rendered value<br>
      <input .value=${live(this.data.value)} placeholder="type here, click commit"><hr>

      Without live: will not update if out of sync with last rendered value<br>
      <input .value=${this.data.value} placeholder="type here, click commit">
    `;
  }

  private commitValue() {
    this.data = {...this.data, value: this.input.value};
  }
}
