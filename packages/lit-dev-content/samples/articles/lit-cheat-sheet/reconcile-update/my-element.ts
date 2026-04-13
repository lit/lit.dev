import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property() savedString = '';

  update(changed: PropertyValues<this>) {
    // localStorage is only available in the browser so we put this reactive
    // property reconciliation in an update() method.
    if (changed.has('savedString')) {
      window.localStorage.setItem('savedString', this.savedString);
    }

    if (window.localStorage.getItem('savedString') !== this.savedString) {
      this.savedString = window.localStorage.getItem('savedString') ?? '';
    }

    super.update(changed);
  }

  render() {
    return html`
      <div>
        The string saved in localstorage is: ${this.savedString}
      </div>
      ${this.#renderSavedStringControls()}
    `;
  }

  #renderSavedStringControls() {
    /* playground-fold */
    return html`
      <input
        type="text"
        .value=${live(this.savedString)}
        @input=${(e: Event) => {
          this.savedString = (e.target as HTMLInputElement).value;
        }}
      />
    `;
    /* playground-fold-end */

  }
}
