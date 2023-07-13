import {css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SuperElement} from './super-element.js';

@customElement('my-element')
export class MyElement extends SuperElement {
  static styles = [
    SuperElement.styles,
    css`div {
      color: red;
    }`
  ];
}
