import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {MouseController} from './mouse-controller.js';

@customElement('my-element')
class MyElement extends LitElement {
  private mouse = new MouseController(this);

  render() {
    return html`
      <h3>The mouse is at:</h3>
      <pre>
        x: ${this.mouse.pos.x as number}
        y: ${this.mouse.pos.y as number}
      </pre>
    `;
  }
}
