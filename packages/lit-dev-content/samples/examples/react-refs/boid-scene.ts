/*
  This file is for demo purposes only.

  If interested, this boid demo runs on a
  integration timestep.

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
  fpsAsMS: number;
  deltaTime: number;
  now: number;
  integral: number;
  rafId: number;
  wanderers: Wanderer[];
}

class Wanderer {
  // wander bubble
  bubbleRadius = Math.random() * 10 + 10;
  bubbleDist = Math.random() * 15 + 50;
  radians = Math.random() * Math.PI * 2;
  wedge = Math.random() * 0.2 + 0.1;
  bubble: Vector = { x: 0, y: 0 };

  // vehicle
  mass = 5 + Math.random() * 5;
  velocity = 2 + Math.random() * 3;
  pos: Vector = { x: 0, y: 0 };
  theta: Vector = { x: 0, y: 0 };
  color: number[] = [
    100 + Math.floor(Math.random() * 155),
    100 + Math.floor(Math.random() * 155),
    220,
  ]
}

const createScene = (): Scene => ({
    fpsAsMS: 1,
    deltaTime: 1,
    now: performance.now(),
    integral: 0.02 * 1000,
    rafId: -1,
    wanderers: [new Wanderer(), new Wanderer(), new Wanderer()],
  });

const renderScene = (
  canvas: HTMLCanvasElement,
  state: Scene,
) => {
  const ctx = canvas.getContext('2d');
  if (ctx === null) return;

  // throttle renders
  const now = performance.now();
  const delta = now - state.now;
  if (delta < Math.max(state.fpsAsMS, state.integral)) {
    return;
  }

  // integrate fixed timestep
  state.now = now;
  state.deltaTime += Math.min(delta, 500); // max throttle
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
  wndr.radians += (Math.random() * 2 - 1) * wndr.wedge;
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

export type { Scene };

export{ createScene, renderScene }