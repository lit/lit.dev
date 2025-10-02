import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {
  trustedStyles,
  type CSSStyleSheet,
} from './trusted-stringified-css-source.js';

// Use constructable stylesheets on TRUSTED CSS strings to use them in a LitElement
const styles = new CSSStyleSheet();
// this type assertion is needed for the older version of TS like that the lit.dev website uses
(styles as unknown as CSSStyleSheet).replace(trustedStyles);

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = styles;
  render() {
    return html` <div>This should be red!</div> `;
  }
}
