import {LitElement, html} from 'lit';
import {Highlightable} from './highlightable.js';

export class ElementOne extends Highlightable(LitElement) {
  render() {
    return this.renderHighlight(html`<p>Simple highlight</p>`);
  }
}
customElements.define('element-one', ElementOne);
