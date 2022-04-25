import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('brick-viewer')
class BrickViewer extends LitElement {
  render() {
    return html`<div>Brick viewer</div>`;
  }
}