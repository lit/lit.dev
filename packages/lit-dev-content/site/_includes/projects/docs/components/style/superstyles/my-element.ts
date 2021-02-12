import { css, customElement } from 'lit-element';
import { SuperElement } from './super-element.js';

@customElement('my-element')
export class MyElement extends SuperElement {
  static get styles() {
    return [
      super.styles,
      css`div {
        color: red;
      }`
    ];
  }
}
