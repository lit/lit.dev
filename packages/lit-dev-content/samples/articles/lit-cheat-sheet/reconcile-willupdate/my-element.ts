import {html, LitElement, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Number}) a = 0;
  @property({type: Number}) doubleA = 0;

  willUpdate(changed: PropertyValues<this>) {
    // A and doubleA are dependent on each other, so we need to reconcile them.
    // They don't rely on any DOM or browser features, so we can do this in
    // willUpdate which would run on the server in SSR as well.
    if (changed.has('a')) {
      this.doubleA = this.a * 2;
    }

    if (changed.has('doubleA')) {
      this.a = this.doubleA / 2;
    }
  }

  render() {
    return html`
      <div>value of a: ${this.a}</div>
      <div>value of double a: ${this.doubleA}</div>
      ${this.#renderAControls()}
    `;
  }

  #renderAControls() {
    /* playground-fold */
    return html`
      <input
        type="number"
        .valueAsNumber=${live(this.a)}
        @input=${(e: Event) => {
          this.a = (e.target as HTMLInputElement).valueAsNumber;
        }}
      />
      <input
        type="number"
        .valueAsNumber=${live(this.doubleA)}
        @input=${(e: Event) => {
          this.doubleA = (e.target as HTMLInputElement).valueAsNumber;
        }}
      />
    `;
    /* playground-fold-end */
  }
}
