import { html, css, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";

type DragType = "none" | "canvas" | "element";
type SupportedNode = HTMLElement | SVGElement;

@customElement("draggable-dom")
export class DraggableDOM extends LitElement {
  @query("main") root!: HTMLElement;
  @query("#children") container!: HTMLElement;
  @query("canvas") canvas!: HTMLCanvasElement;
  dragType: DragType = "none";
  offset: Offset = { x: 0, y: 0 };
  pointerMap: Map<number, PointerData> = new Map();

  static styles = css`
    :host {
      --offset-x: 0;
      --offset-y: 0;
      --grid-background-color: white;
      --grid-color: black;
      --grid-size: 40px;
      --grid-dot-size: 1px;
    }
    main {
      overflow: hidden;
    }
    canvas {
      background-size: var(--grid-size) var(--grid-size);
      background-image: radial-gradient(
        circle,
        var(--grid-color) var(--grid-dot-size),
        var(--grid-background-color) var(--grid-dot-size)
      );
      background-position: var(--offset-x) var(--offset-y);
      z-index: 0;
    }
    .full-size {
      width: 100%;
      height: 100%;
      position: fixed;
      transform: translate(var(--dx), var(--dy));
    }
    .child {
      --dx: 0px;
      --dy: 0px;
      position: fixed;
      flex-shrink: 1;
      z-index: var(--layer, 0);
      transform: translate(var(--dx), var(--dy));
    }
    @media (prefers-color-scheme: dark) {
      main {
        --grid-background-color: black;
        --grid-color: grey;
      }
    }
  `;

  render() {
    return html`
      <main
        class="full-size"
        @pointerdown=${(e: any) => this.handleDown(e, "canvas")}
        @pointermove=${(e: any) =>
          this.handleMove(e, "canvas", (delta) => this.moveCanvas(delta))}
        @touchstart=${(e: any) => this.handleDown(e, "canvas")}
        @touchmove=${(e: any) =>
          this.handleMove(e, "canvas", (delta) => this.moveCanvas(delta))}
        @pointerup=${(e: any) => this.handleUp(e)}
      >
        <canvas class="full-size"></canvas>
        <div id="children" class="full-size">
          <slot
            class="child"
            draggable="false"
            @pointerdown=${(e: any) => this.handleDown(e, "element")}
            @pointermove=${(e: any) =>
              this.handleMove(e, "element", (delta) => {
                this.moveElement(
                  e.target.parentElement === this
                    ? e.target
                    : e.target.parentElement,
                  delta
                );
              })}
            @touchstart=${(e: any) => this.handleDown(e, "element")}
            @touchmove=${(e: any) =>
              this.handleMove(e, "element", (delta) =>
                this.moveElement(
                  e.target.parentElement === this
                    ? e.target
                    : e.target.parentElement,
                  delta
                )
              )}
          ></slot>
        </div>
      </main>
    `;
  }

  handleDown(event: PointerEvent, type: DragType) {
    if (this.dragType === "none") {
      event.preventDefault();
      this.dragType = type;
      (event.target as Element).setPointerCapture(event.pointerId);
      this.pointerMap.set(event.pointerId, {
        id: event.pointerId,
        startPos: { x: event.clientX, y: event.clientY },
        currentPos: { x: event.clientX, y: event.clientY },
      });
    }
  }

  handleMove(
    event: PointerEvent,
    type: DragType,
    onMove: (delta: Offset) => void
  ) {
    if (this.dragType === type) {
      event.preventDefault();
      const saved = this.pointerMap.get(event.pointerId)!;
      const current = { ...saved.currentPos };
      saved.currentPos = { x: event.clientX, y: event.clientY };
      const delta = {
        x: saved.currentPos.x - current.x,
        y: saved.currentPos.y - current.y,
      };
      onMove(delta);
    }
  }

  handleUp(event: PointerEvent) {
    this.dragType = "none";
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  moveCanvas(delta: Offset) {
    this.offset.x += delta.x;
    this.offset.y += delta.y;
    this.root.style.setProperty("--offset-x", `${this.offset.x}px`);
    this.root.style.setProperty("--offset-y", `${this.offset.y}px`);
    this.container.style.setProperty("--dx", `${this.offset.x}px`);
    this.container.style.setProperty("--dy", `${this.offset.y}px`);
  }

  moveElement(child: SupportedNode, delta: Offset) {
    const getNumber = (key: "--dx" | "--dy", fallback: number) => {
      const saved = child.style.getPropertyValue(key);
      if (saved.length > 0) {
        return parseFloat(saved.replace("px", ""));
      }
      return fallback;
    };
    const dx = getNumber("--dx", 0) + delta.x;
    const dy = getNumber("--dy", 0) + delta.y;
    child.style.transform = `translate(${dx}px, ${dy}px)`;
    child.style.setProperty("--dx", `${dx}px`);
    child.style.setProperty("--dy", `${dy}px`);
  }
}

interface Offset {
  x: number;
  y: number;
}

interface PointerData {
  id: number;
  startPos: Offset;
  currentPos: Offset;
}
