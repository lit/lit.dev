import { LitElement, html, css, customElement } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    .alert {
      padding: 16px;
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
