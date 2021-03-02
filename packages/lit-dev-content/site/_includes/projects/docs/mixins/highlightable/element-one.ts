import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators';
import { Highlightable } from './highlightable.js'

@customElement('element-one')
class ElementOne extends Highlightable(LitElement) {
  render(){
    return this.renderHighlight(html`<p>Simple highlight</p>`);
  }
}
