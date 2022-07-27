import { css, html, LitElement } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

/*
  This file is for demo purposes only.
  The point of this demo is to provide a web component
  that is stateful and uncontrolled.

  The WanderBoids web component exposes the following API:
  WanderBoids::play()
  WanderBoids::pause()
  
*/

interface Vector {
  x: number;
  y: number;
}

interface State {
  fpsAsMS: number;
  deltaTime: number;
  now: number;
  integral: number;
  rafId: number;
  wanderers: Wanderer[];
}

const styles = css`
  canvas {
    border: 5px solid #343434;
  }
`;

@customElement('wander-boids')
export class WanderBoids extends LitElement {
  static styles = styles;

  // canvas
  @query('canvas') canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  // timestep & animation
  @property({ type: Number }) fps = 24

  state: State = {
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

  play() {
    if (
      this.canvas === null ||
      this.ctx === null ||
      this.state.rafId !== -1
    ) return;

    this.ctx = this.canvas.getContext('2d')!;
    this._renderCanvas();
  }

  pause() {
    if (this.state.rafId === -1) return;

    cancelAnimationFrame(this.state.rafId);
    this.state.rafId = -1;
  }

  _renderCanvas = () => {
    if (this.ctx === null) return;
    this.state.rafId = requestAnimationFrame(this._renderCanvas);

    renderScene(this.ctx, this.canvas, this.state);
  }
}

class Wanderer {
  // wander bubble
  bubbleRadius = Math.random() * 10 + 2;
  bubbleDist = Math.random() * 25 + 75;
  wedge = 0.1;
  radians = Math.random() * Math.PI * 2;

  // vehicle
  mass = Math.random() * 2 + 2;
  pos: Vector = { x: 0, y: 0 };
  theta: Vector = { x: 0, y: 0 };
  velocity = Math.random() + 1;
  color: number[] = [
    100 + Math.floor(Math.random() * 155),
    100 + Math.floor(Math.random() * 155),
    220,
  ]
}

const normalize = (vec: Vector, mag: number = 1): Vector => {
  const sq = Math.sqrt((vec.x * vec.x + vec.y * vec.y));
  return {
    x: vec.x / sq * mag,
    y: vec.y / sq * mag,
  }
}

const renderScene = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: State,
) => {
  // throttle renders
  const now = performance.now();
  const delta = now - state.now;
  if (delta < Math.max(state.fpsAsMS, state.integral)) {
    return;
  }

  // update positions, cheap timestep
  state.now = now;
  state.deltaTime += delta;
  while (state.deltaTime > state.integral) {
    state.deltaTime -= state.integral;
    for (const wndr of state.wanderers) {
      integrate(wndr);
    }
  }

  // wrap characters inside the scene
  for (const wndr of state.wanderers) {
    wrapPos(wndr, canvas.width, canvas.height);
  }

  // draw scene
  draw(ctx, canvas, state.wanderers);
}

const integrate = (wndr: Wanderer) => {
  // increment chase bubble
  wndr.radians += Math.random() * wndr.wedge;
  wndr.radians %= Math.PI * 2;

  // get chase bubble vector
  const bubble: Vector = {
    x: (wndr.theta.x * wndr.bubbleDist) + (Math.cos(wndr.radians) * wndr.bubbleRadius),
    y: (wndr.theta.y * wndr.bubbleDist) + (Math.sin(wndr.radians) * wndr.bubbleRadius),
  };

  // get orientation 
  const normBubble = normalize(bubble);
  wndr.theta.x += normBubble.x / wndr.mass;
  wndr.theta.y += normBubble.y / wndr.mass;
  wndr.theta = normalize(wndr.theta);

  // add pos
  wndr.pos.x += wndr.theta.x * wndr.velocity;
  wndr.pos.y += wndr.theta.y * wndr.velocity;
}

const wrapPos = (wndr: Wanderer, width: number, height: number) => {
  wndr.pos.y = (wndr.pos.y + height) % height;
  wndr.pos.x = (wndr.pos.x + width) % width;
}

const draw = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  wndrs: Wanderer[],
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dedede';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const wndr of wndrs) {
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
