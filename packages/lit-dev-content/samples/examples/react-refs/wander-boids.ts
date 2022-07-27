import { css, html, LitElement } from 'lit';
import { customElement, query, state, property } from 'lit/decorators.js';

/*
  This file is for demo purposes only.
  The point of this demo is to provide a web component
  that is stateful and uncontrolled.

  The WanderBoid web component exposes the following API:
  WanderBoids::play()
  WanderBoids::pause()
  
*/

interface Vector {
  x: number;
  y: number;
}

interface Scene {
  fpsAsMS: number;
  deltaTime: number;
  now: number;
  integral: number;
  rafId: number;
  wanderers: Wanderer[];
}

export interface WanderBoidState {
  isPlaying: boolean;
  fps: number;
}

const styles = css`
  canvas {
    border: 5px solid #343434;
  }
`;

@customElement('wander-boid')
export class WanderBoid extends LitElement {
  static styles = styles;

  // canvas
  @query('canvas') private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // timestep & animation
  @property({ type: Number }) fps = 24;
  @state() private isPlaying = false;

  private state: Scene = {
    fpsAsMS: 1,
    deltaTime: 1000 / this.fps,
    now: performance.now(),
    integral: 0.02 * 1000,
    rafId: -1,
    wanderers: [new Wanderer(), new Wanderer(), new Wanderer()],
  }

  render() {
    this.state.fpsAsMS = 1000 / this.fps;

    return html`
      <canvas height="300" width="300"></canvas>
    `;
  }

  firstUpdated() {
    // the canvas element needs to be available to @query
    this.play();
  }

  updated() {
    this.dispatchEvent(
      new CustomEvent<WanderBoidState>(
        'wander-boid-state',
        {
          composed: true,
          detail: {
            isPlaying: this.isPlaying,
            fps: this.fps
          }
        },
      )
    );
  }

  play() {
    if (this.isPlaying) return;

    if (
      this.canvas === null ||
      this.ctx === null
    ) return;

    this.isPlaying = true;
    this.ctx = this.canvas.getContext('2d')!;
    this._renderCanvas();
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    cancelAnimationFrame(this.state.rafId);
  }

  private _renderCanvas = () => {
    if (this.ctx === null) return;
    this.state.rafId = requestAnimationFrame(this._renderCanvas);

    renderScene(this.ctx, this.canvas, this.state);
  }
}

class Wanderer {
  // wander bubble
  bubbleRadius = Math.random() * 10 + 2;
  bubbleDist = Math.random() * 25 + 75;
  radians = Math.random() * Math.PI * 2;
  wedge = 0.1;
  bubble: Vector = { x: 0, y: 0 };

  // vehicle
  mass = Math.random() * 2 + 2;
  velocity = Math.random() + 1;
  pos: Vector = { x: 0, y: 0 };
  theta: Vector = { x: 0, y: 0 };
  color: number[] = [
    100 + Math.floor(Math.random() * 155),
    100 + Math.floor(Math.random() * 155),
    220,
  ]
}

const renderScene = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: Scene,
) => {
  // throttle renders
  const now = performance.now();
  const delta = now - state.now;
  if (delta < Math.max(state.fpsAsMS, state.integral)) {
    return;
  }

  // integrate fixed timestep
  state.now = now;
  state.deltaTime += Math.min(delta, 250); // max throttle
  while (state.deltaTime > state.integral) {
    state.deltaTime -= state.integral;
    // update scene objects
    for (const wndr of state.wanderers) {
      integrate(wndr);
    }
  }

  // wrap characters inside the scene
  for (const wndr of state.wanderers) {
    wrapPos(wndr, canvas);
  }

  // draw scene
  drawScene(ctx, canvas, state);
}

const integrate = (wndr: Wanderer) => {
  // increment chase bubble
  wndr.radians += Math.random() * wndr.wedge;
  wndr.radians %= Math.PI * 2;

  // build chase bubble vector
  wndr.bubble.x = (wndr.theta.x * wndr.bubbleDist) + (Math.cos(wndr.radians) * wndr.bubbleRadius),
  wndr.bubble.y = (wndr.theta.y * wndr.bubbleDist) + (Math.sin(wndr.radians) * wndr.bubbleRadius),

  // get orientation 
  normalize(wndr.bubble);
  wndr.theta.x += wndr.bubble.x / wndr.mass;
  wndr.theta.y += wndr.bubble.y / wndr.mass;
  normalize(wndr.theta);

  // add pos
  wndr.pos.x += wndr.theta.x * wndr.velocity;
  wndr.pos.y += wndr.theta.y * wndr.velocity;
}

const normalize = (vec: Vector, mag: number = 1) => {
  const sq = Math.sqrt((vec.x * vec.x + vec.y * vec.y));
  vec.x = vec.x / sq * mag;
  vec.y = vec.y / sq * mag;
}

const wrapPos = (wndr: Wanderer, canvas: HTMLCanvasElement) => {
  wndr.pos.y = (wndr.pos.y + canvas.height) % canvas.height;
  wndr.pos.x = (wndr.pos.x + canvas.width) % canvas.width;
}

const drawScene = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: Scene,
) => {
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
}
