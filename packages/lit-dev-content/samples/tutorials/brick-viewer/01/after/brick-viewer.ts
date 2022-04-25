import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('brick-viewer')
class BrickViewer extends LitElement {
  @property({type: String})
  src: string|null = null;

  render() {
    return html`<div>Brick model: ${this.src}</div>`;
  }
}