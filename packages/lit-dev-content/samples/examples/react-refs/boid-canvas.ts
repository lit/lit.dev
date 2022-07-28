import { css, html, LitElement } from 'lit';
import { customElement, query, state, property } from 'lit/decorators.js';

import { createScene, renderScene } from './boid-scene.js';

/*
  This file is for demo purposes only.

  This module provides a web component that is stateful and uncontrolled
  similar to video and audio elements.

  The BoidCanvas exposes the following API:
    methods:
      - play()
      - pause()

    attributes:
      - fps (frames per second)
    
    properties:
      - isPlaying

    events:
      - 'state-change' 
*/

const styles = css`
  canvas {
    border: 5px solid #343434;
  }
`;

@customElement('boid-canvas')
export class BoidCanvas extends LitElement {
  static styles = styles;

  @property({ type: Number }) fps = 24;
  @state() isPlaying = false;

  @query('canvas') private canvas!: HTMLCanvasElement;
  private scene = createScene()

  play() {
    if (
      this.isPlaying ||
      this.canvas === null
    ) return;

    this.isPlaying = true;
    this.renderCanvas()
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    cancelAnimationFrame(this.scene.rafId);
  }

  render() {
    return html`
      <canvas height="300" width="300"></canvas>
    `;
  }

  firstUpdated(): void {
    // the canvas element needs to be available
    // from @query to "play"
    this.play();
  }

  updated() {
    this.scene.fpsAsMS = 1000 / this.fps;
    this.dispatchEvent(new Event('state-change', { composed: true }));
  }

  private renderCanvas = () => {
    this.scene.rafId = requestAnimationFrame(this.renderCanvas);
    renderScene(this.canvas, this.scene);
  }
}