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

const PI2 = Math.PI * 2;

const styles = css`
  canvas {
    border: 5px solid #343434;
  }
`;

@customElement('wander-boid')
export class WanderBoids extends LitElement {
  static styles = styles;

  @property({type: Number}) fps = 24
  @query('canvas') canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;

  fpsAsMS = 1 / this.fps * 1000; // fps at 12 frames a second as milliseconds
  integral = 0.02 * 1000
  deltaTime = 1 / this.fps * 1000;
  now = performance.now();
  rafId = -1;

  wanderers = [new Wanderer(), new Wanderer(), new Wanderer()];

  render() {
    this.fpsAsMS = 1 / this.fps * 1000; // fps at 12 frames a second as milliseconds

    return html`
      <canvas height="300" width="300"></canvas>
    `;
  }

  firstUpdated() {
    this.play();
  }

  play() {
    if (this.canvas === null || this.rafId !== -1) return;

    this.ctx = this.canvas.getContext('2d');
    this._renderCanvas();
  }

  pause() {
    if (this.rafId === -1) return;

    cancelAnimationFrame(this.rafId);
    this.rafId = -1;
  }

  _renderCanvas = () => {
    if (this.ctx === null) return;
    this.rafId = requestAnimationFrame(this._renderCanvas)

    // throttle renders
    const now = performance.now();
    this.deltaTime += now - this.now;
    if (this.deltaTime < this.fpsAsMS) {
      return
    }

    // update positions, cheap timestep
    let timePassed = Math.min(this.deltaTime, this.fpsAsMS + this.integral);
    while(timePassed > 0) {
      timePassed -= this.integral;
      for (const wndr of this.wanderers) {
        integrate(wndr);
      }
    }

    // wrap positions inside grid
    for (const wndr of this.wanderers) {
      wrapPos(wndr, this.canvas.width, this.canvas.height);
    }

    // update timestep
    this.deltaTime %= this.fpsAsMS;
    this.now = now;
        
    // draw scene
    draw(this.ctx, this.canvas, this.wanderers);
  }
}

class Wanderer {
  // wander bubble
  bubbleRadius = Math.random() * 10 + 2;
  bubbleDist = Math.random() * 25 + 75;
  wedge = 0.1;
  radians = Math.random() * PI2;

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

const integrate = (wndr: Wanderer) => {
  // increment chase bubble
  wndr.radians += Math.random() * wndr.wedge;
  wndr.radians %= PI2;

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

const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, wndrs: Wanderer[]) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dedede';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const wndr of wndrs) {
    ctx.save();

    // translations
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
