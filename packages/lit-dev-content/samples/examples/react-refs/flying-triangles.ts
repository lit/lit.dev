import {css, html, LitElement} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';

/*
  This file is for demo purposes only.

  This module provides a web component that is stateful
  and uncontrolled similar to video and audio elements.

  The <flying-triangles> web component exposes the following API:
    methods:
      - play()
      - pause()

    properties:
      - isPlaying

    events:
      - 'playing-change' 
*/

const styles = css`
  :host {
    max-width: 300px;
    position: relative;
    display: block;
    cursor: pointer;
  }

  canvas {
    border: 5px solid #343434;
  }

  p {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    opacity: 0.4;
    margin: 0;
  }
`;

@customElement('flying-triangles')
export class FlyingTriangles extends LitElement {
  static styles = styles;

  @query('canvas') private canvas!: HTMLCanvasElement;
  @state() isPlaying = false;

  private scene = createScene();
  private fps: number = 54;

  render() {
    return html`
      <div @click=${this.onClick}>
        <canvas height="300" width="300"></canvas>
        <p>${this.isPlaying ? 'click to pause' : 'click to play'}</p>
      </div>
    `;
  }

  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.renderCanvas();
    this.onPlayingChange();
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    cancelAnimationFrame(this.scene.rafId);
    this.onPlayingChange();
  }

  private onClick() {
    this.isPlaying ? this.pause() : this.play();
  }

  private onPlayingChange() {
    this.dispatchEvent(new Event('playing-change', {composed: true}));
  }

  private renderCanvas = () => {
    this.scene.rafId = requestAnimationFrame(this.renderCanvas);
    renderScene(this.canvas, this.scene, this.fps);
  };
}

/*
  This is a boid scene with an integration timestep.

  On every render, an integration step calculates
  the boid "physics" up until the most recent render.

  This separates scene mechanics from the render
  and provides the ability to change frames per second
  rendered without affecting scene "physics".
*/

interface Vector {
  x: number;
  y: number;
}

interface Scene {
  deltaTime: number;
  timestamp: number;
  integral: number;
  rafId: number;
  wanderers: Wanderer[];
}

class Wanderer {
  // target bubble
  bubbleRadius = 10 + Math.random() * 10;
  bubbleDist = 50 + Math.random() * 15;
  wedge = 0.1 + Math.random() * 0.2;
  radians = Math.random() * Math.PI * 2;
  target: Vector = {x: 0, y: 0};

  // vehicle
  mass = 5 + Math.random() * 5;
  velocity = 2 + Math.random() * 3;
  pos: Vector = {x: 0, y: 0};
  theta: Vector = {x: 0, y: 0};
  color: number[] = [
    100 + Math.floor(Math.random() * 155),
    100 + Math.floor(Math.random() * 155),
    220,
  ];
}

const createScene = (): Scene => ({
  deltaTime: 0,
  timestamp: performance.now(),
  integral: 20,
  rafId: -1,
  wanderers: [new Wanderer(), new Wanderer(), new Wanderer()],
});

const renderScene = (canvas: HTMLCanvasElement, state: Scene, fps: number) => {
  // throttle renders
  const now = performance.now();
  const delta = now - state.timestamp;
  const fpsAsMS = 1000 / fps;
  if (delta < Math.max(fpsAsMS, state.integral)) {
    return;
  }

  state.timestamp = now;
  // throttle integration around 3 fps
  state.deltaTime += Math.min(delta, 350);
  // integrate timestep
  while (state.deltaTime > state.integral) {
    state.deltaTime -= state.integral;
    // update scene objects
    for (const wndr of state.wanderers) {
      integrate(wndr);
    }
  }

  // wrap characters inside the scene
  for (const wndr of state.wanderers) {
    wrapPos(canvas, wndr);
  }

  drawScene(canvas, state);
};

const integrate = (wndr: Wanderer) => {
  // increment chase bubble
  wndr.radians += (Math.random() * 2 - 1) * wndr.wedge;
  wndr.radians %= Math.PI * 2;

  // build chase bubble target
  wndr.target.x =
    wndr.theta.x * wndr.bubbleDist + Math.cos(wndr.radians) * wndr.bubbleRadius;
  wndr.target.y =
    wndr.theta.y * wndr.bubbleDist + Math.sin(wndr.radians) * wndr.bubbleRadius;

  // get orientation
  normalize(wndr.target);
  wndr.theta.x += wndr.target.x / wndr.mass;
  wndr.theta.y += wndr.target.y / wndr.mass;
  normalize(wndr.theta);

  // add pos
  wndr.pos.x += wndr.theta.x * wndr.velocity;
  wndr.pos.y += wndr.theta.y * wndr.velocity;
};

const normalize = (vec: Vector, mag: number = 1) => {
  const sq = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  vec.x = (vec.x / sq) * mag;
  vec.y = (vec.y / sq) * mag;
};

const wrapPos = (canvas: HTMLCanvasElement, wndr: Wanderer) => {
  wndr.pos.y = ((wndr.pos.y % canvas.height) + canvas.height) % canvas.height;
  wndr.pos.x = ((wndr.pos.x % canvas.width) + canvas.width) % canvas.width;
};

const drawScene = (canvas: HTMLCanvasElement, state: Scene) => {
  const ctx = canvas.getContext('2d');
  if (ctx === null) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dedede';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const wndr of state.wanderers) {
    ctx.save();

    // translate canvas
    ctx.translate(wndr.pos.x, wndr.pos.y);
    ctx.rotate(Math.atan2(wndr.theta.x, wndr.theta.y) * -1);

    // build the triangle
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(0, 10);
    ctx.lineTo(10, -10);
    ctx.lineTo(0, -7);
    ctx.closePath();

    // paint the triangle
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#343434';
    ctx.stroke();
    ctx.fillStyle = `rgb(${wndr.color[0]},${wndr.color[1]},${wndr.color[2]})`;
    ctx.fill();

    ctx.restore();
  }
};

declare global {
  interface HTMLElementTagNameMap {
    'flying-triangles': FlyingTriangles;
  }
}
