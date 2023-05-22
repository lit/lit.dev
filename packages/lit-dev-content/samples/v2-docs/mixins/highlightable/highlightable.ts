/* playground-fold */
import {LitElement, css, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {property} from 'lit/decorators/property.js';

type Constructor<T> = new (...args: any[]) => T;

export declare class HighlightableInterface {
  highlight: boolean;
  renderHighlight(content: unknown): unknown;
}
/* playground-fold-end */

export const Highlightable =
  <T extends Constructor<LitElement>>(superClass: T) => {
    class HighlightableElement extends superClass {
      // Adds some styles...
      static styles = [
        (superClass as unknown as typeof LitElement).styles ?? [],
        css`.highlight { background: yellow; }`
      ];

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
      return HighlightableElement as Constructor<HighlightableInterface> & T;
    };
