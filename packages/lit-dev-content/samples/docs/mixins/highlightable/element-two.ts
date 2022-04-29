import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {Highlightable} from './highlightable.js'

@customElement('element-two')
export class ElementTwo extends Highlightable(LitElement) {
  static styles = [
    super.styles || [],
    css`:host { display: block; }`
  ];
  render(){
    return this.renderHighlight(html`
      <label>
        <input type="checkbox"
          .checked=${this.highlight}
          @change=${this.toggleHighlight}>
        Toggleable highlight
      </label>
    `);
  }
  private toggleHighlight(event: Event) {
    this.highlight = (event.target as HTMLInputElement).checked;
  }
}
