import { html, LitElement, css, PropertyValues } from 'lit';
import { customElement, state, property, queryAsync } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Boolean}) showCanvas = false;
  @state() private canvasText = 'Hello World!';
  // You can use any querySelector selector
  @queryAsync('#canvasId') private canvasEl!: Promise<HTMLCanvasElement|null>;

  protected update(changed: PropertyValues<this>) {
    if (changed.has('showCanvas')) {
      // Typically the DOM update isn't ready until after the render method
      this.setCanvasText(this.canvasText);
    }

    super.update(changed);
  }

  render() {
    return html`
      ${
        this.showCanvas ?
        html`<canvas id="canvasId"></canvas>` :
        html`<button @click=${() => this.showCanvas = true}>Show Canvas</button>`
      }
      <label>
        Enter text to draw in canvas:
        <input @input=${this.handleInput} .value=${this.canvasText}>
      </label>
    `;
  }

  private async setCanvasText(text: string) {
    this.canvasText = text;
    const canvasEl = await this.canvasEl;

    // canvasEl can be null if the element is not in the DOM
    if (!canvasEl) {
      return;
    }

    const ctx = canvasEl?.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.font = "50px Arial";
    ctx.fillText(this.canvasText,10,80);
  }

  private handleInput(event: Event) {
    this.setCanvasText((event.target as HTMLInputElement).value);
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
