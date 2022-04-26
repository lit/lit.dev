import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@customElement('brick-viewer')
class BrickViewer extends LitElement {
  @property({type: String})
  src: string|null = null;

  render() {
    return html`<div>Brick model: ${this.src}</div>`;
  }
}