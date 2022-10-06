import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles, svgCross} from './styles.js';
import {ResizeController} from '@lit-labs/observers/resize_controller.js';

/**
 * This example demonstrates a simple usage of the ResizeController exported
 * from the `@lit-labs/observers` package. This element uses a resize controller
 * to render its width and height.
 *
 * The controller automatically triggers a reactive update when a resize on the
 * element is observed.
 */
@customElement('simple-resize-demo')
export class SimpleResizeDemo extends LitElement {
  static styles = styles;

  private resizeController = new ResizeController(this, {
    callback([entry]) {
      return [entry.contentRect.width, entry.contentRect.height];
    },
  });

  render() {
    const [width, height] = this.resizeController.value ?? [0, 0];
    return html`
      ${svgCross}
      <span>${width.toFixed(0)}px by ${height.toFixed(0)}px</span>
    `;
  }
}
