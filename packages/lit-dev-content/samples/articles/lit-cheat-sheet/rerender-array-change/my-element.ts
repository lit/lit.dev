import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  // Technically `@state` is not necessary for the way we modify
  // `_requestUpdateArray`, but it's generally good practice to use it.
  @state() private _requestUpdateArray: number[] = [];
  @state() private _newReferenceArray: number[] = [];

  render() {
    return html`
      <section>
        Request Update Array: [${this._requestUpdateArray.join(', ')}]
        <div>
          <button @click=${this._addToRequestUpdateArray}>Add Element</button>
        </div>
      </section>

      <section>
        New Reference Array: [${this._newReferenceArray.join(', ')}]
        <div>
          <button @click=${this._addToNewReferenceArray}>Add Element</button>
        </div>
      </section>
    `;
  }

  private _addToRequestUpdateArray() {
    this._requestUpdateArray.push(this._requestUpdateArray.length);
    // Call request update to tell Lit that something has changed.
    this.requestUpdate();
  }

  private _addToNewReferenceArray() {
    // This creates a new array / object reference, so it will trigger an update
    // with the default change detection. Could be expensive for large arrays.
    this._newReferenceArray = [
      ...this._newReferenceArray,
      this._newReferenceArray.length,
    ];
  }
}