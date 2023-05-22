/* playground-fold */
import {css, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
/* playground-fold-end */

export const Highlightable = (superClass) => {
  class HighlightableElement extends superClass {
    static properties = {
      highlight: {type: Boolean},
    };
    // Adds some styles...
    static styles = [
      superClass.styles ?? [],
      css`.highlight { background: yellow; }`,
    ];

    constructor() {
      super();
      // ...a public `highlight` property/attribute...
      this.highlight = false;
    }

    // ...and a helper render method:
    renderHighlight(content) {
      return html`
          <div class=${classMap({highlight: this.highlight})}>
            ${content}
          </div>`;
    }
  }
  return HighlightableElement;
};
