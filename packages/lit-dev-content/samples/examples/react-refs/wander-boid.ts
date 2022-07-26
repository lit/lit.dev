import { css, html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';

const PI2 = Math.PI * 2;

interface Vector {
  x: number;
  y: number;
}


const styles = css`
  canvas {
    border: 4px solid #343434;
  }
`;

@customElement('wander-boid')
export class WanderBoid extends LitElement {
  static styles = styles;

  @query('#canvas') canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  reciept = -1;

  fps = 0.3 * 1000; // fps at 12 frames a second as milliseconds
  prevNow = performance.now();
  timeDistance = this.fps + 1;

  wanderers = [new Wanderer(), new Wanderer(), new Wanderer()];

  play() {
    if (this.canvas === null || this.reciept !== -1) return;
    this.ctx = this.canvas.getContext('2d');
    this._renderCanvas();
  }

  pause() {
    if (this.reciept === -1) {
      return;
    }
    cancelAnimationFrame(this.reciept);
    this.reciept = -1;
  }

  render() {
    return html`
      <canvas id="canvas" height="300" width="300"></canvas>
    `;
  }

  firstUpdated() {
    for (const wndr of this.wanderers) {
      wndr.pos.x = Math.random() * this.canvas.width;
      wndr.pos.y = Math.random() * this.canvas.height;
    }

    this.play();
  }

  _renderCanvas = () => {
    if (this.ctx === null) {
      return;
    }

    // throttle renders
    const now = performance.now();
    this.timeDistance += now - this.prevNow;
    if (this.timeDistance < this.fps) {
      this.reciept = requestAnimationFrame(this._renderCanvas)
      return
    }
    this.timeDistance %= this.fps;
    this.prevNow = now;

    draw(this.ctx, this.canvas, this.wanderers);

    this.reciept = requestAnimationFrame(this._renderCanvas)
  }
}

class Wanderer {
  // chase bubble
  bubbleRadius = Math.random() * 10 + 10;
  bubbleDist = Math.random() * 25 + 75;

  // bubble location
  radianEdge = 0.5;
  radians = Math.random() * PI2;

  // vehicle
  velocity = 10;
  pos: Vector = { x: 0, y: 0 };
  theta: Vector = { x: 0, y: 0 };

  color: number[] = [
    100 + Math.floor(Math.random() * 100),
    100 + Math.floor(Math.random() * 100),
    255,
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
  wndr.radians += Math.random() * wndr.radianEdge;
  wndr.radians %= PI2;

  // get chase bubble vector
  const bubble: Vector = {
    x: (wndr.theta.x * wndr.bubbleDist) + (Math.cos(wndr.radians) * wndr.bubbleRadius),
    y: (wndr.theta.y * wndr.bubbleDist) + (Math.sin(wndr.radians) * wndr.bubbleRadius),
  };

  // get orientation 
  const normBubble = normalize(bubble);
  wndr.theta.x += normBubble.x;
  wndr.theta.y += normBubble.y;
  wndr.theta = normalize(wndr.theta);

  // add pos
  wndr.pos.x += wndr.theta.x * wndr.velocity;
  wndr.pos.y += wndr.theta.y * wndr.velocity;
}

const truncate = (wndr: Wanderer, width: number, height: number) => {
  if (wndr.pos.x < 0) {
    wndr.pos.x = width - wndr.pos.x * -1;
  }
  wndr.pos.x %= width;

  if (wndr.pos.y < 0) {
    wndr.pos.y = height - wndr.pos.y * -1;
  } 
  wndr.pos.y %= height;
}

const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, wndrs: Wanderer[]) => {
  for (const wndr of wndrs) {
    integrate(wndr);
    truncate(wndr, canvas.width, canvas.height);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dedede';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const wndr of wndrs) {
    ctx.save();

    // translations
    ctx.translate(wndr.pos.x, wndr.pos.y);
    ctx.rotate(Math.atan2(wndr.theta.x, wndr.theta.y) * -1);
    
    // the triangle
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(0, 0);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#343434';
    ctx.stroke();
    ctx.fillStyle = `rgb(${wndr.color[0]},${wndr.color[1]},${wndr.color[2]})`;
    ctx.fill();

    ctx.restore();
  }
}
