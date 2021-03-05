/* playground-fold */
import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators/property.js';

type LitElementConstructor = new (...args: any[]) => LitElement;
/* playground-fold-end */

export const Highlightable =
  <T extends LitElementConstructor>(superClass: T) => {
    class HighlightableSubclass extends superClass {
      // Adds some styles...
      static styles = css`.highlight { background: yellow; }`

      // ...a public `highlight` property/attribute...
      @property({type: Boolean}) highlight = false;

      // ...and a helper render method:
      renderHighlight(content: unknown) {
        return html`
          <div class=${classMap({highlight: this.highlight})}>
            ${content}
          </div>`;
        }
      }
      return HighlightableSubclass;
    };
