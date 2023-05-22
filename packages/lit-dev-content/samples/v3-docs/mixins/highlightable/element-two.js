import {LitElement, html, css} from 'lit';
import {Highlightable} from './highlightable.js';

const HighlightableLitElement = Highlightable(LitElement);

export class ElementTwo extends HighlightableLitElement {
  static styles = [
    HighlightableLitElement.styles || [],
    css`:host { display: block; }`,
  ];
  render() {
    return this.renderHighlight(html`
      <label>
        <input type="checkbox"
          .checked=${this.highlight}
          @change=${this.toggleHighlight}>
        Toggleable highlight
      </label>
    `);
  }
  toggleHighlight(event) {
    this.highlight = event.target.checked;
  }
}
customElements.define('element-two', ElementTwo);
