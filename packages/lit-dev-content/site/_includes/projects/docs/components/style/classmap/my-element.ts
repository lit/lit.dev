import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element';
import { classMap } from 'lit/directives/class-map';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    .alert {
      background-color: whitesmoke;
    }
    .info {
      color: blue;
    }
  `;
  protected render() {
    return html`
      <div class=${classMap({alert:true,info:true})}>Content.</div>
    `;
  }
}
