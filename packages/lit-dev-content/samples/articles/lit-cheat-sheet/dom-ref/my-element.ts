import { html, LitElement, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ref, createRef } from 'lit/directives/ref.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() private canvasText = 'Hello World!';
  private canvasRef = createRef<HTMLCanvasElement>();

  render() {
    return html`
      <canvas id="canvasId" ${ref(this.canvasRef)}></canvas>
      <label>
        Enter text to draw in canvas:
        <input @input=${this.handleInput} .value=${this.canvasText}>
      </label>
    `;
  }

  private setCanvasText(text: string) {
    if (!this.canvasRef.value) {
      return;
    }
    this.canvasText = text;
    // Access the canvas element with this.canvasEl
    const ctx = this.canvasRef.value.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, this.canvasRef.value.width, this.canvasRef.value.height);
    ctx.font = "50px Arial";
    ctx.fillText(this.canvasText,10,80);
  }

  private handleInput(event: Event) {
    this.setCanvasText((event.target as HTMLInputElement).value);
  }

  protected firstUpdated() {
    // DOM is typically ready for the first time by firstUpdated()
    this.setCanvasText(this.canvasText);
  }

  static styles = css`/* playground-fold */
    canvas {
      border: 1px solid black;
    }

    label {
      display: block;
      margin-block-start: 1em;
    }
  /* playground-fold-end */`;
}
