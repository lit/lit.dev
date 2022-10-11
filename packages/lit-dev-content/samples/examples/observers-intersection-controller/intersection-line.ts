import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * This component visualizes the rootMargin setting passed into the IntersectionController.
 */
@customElement('intersection-line')
export class IntersectionLine extends LitElement {
  render() {
    return html`<p>
      The Intersection Controller monitors when elements cross this line. Scroll
      shapes across the line.
    </p>`;
  }

  static styles = css`
    :host {
      width: 100%;
      position: fixed;
      bottom: 200px;
      left: 0;
      right: 0;
      pointer-events: none;
    }
    p {
      background-color: #324fff;
      color: white;
      font-family: sans-serif;
      margin: 0;
    }
  `;
}
