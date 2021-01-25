import { css } from 'lit-element';
import { SuperElement } from './super-element.js';

class MyElement extends SuperElement {
  static styles = [
    super.styles,
    css`button { color: red; }`
  ];
}
customElements.define('my-element', MyElement);
