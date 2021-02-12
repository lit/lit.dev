import { LitElement, html, css, customElement } from 'lit-element';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    * { color: green; padding: 8px; }
    p { font-family: sans-serif; }
    .myclass { border: 1px dashed gray; }
    #main { border: 2px double steelblue; }
    h4 { border: 1px solid tomato; }
  `;
  protected render() {
    return html`
      <p>Hello World</p>
      <p class="myclass">Hello World</p>
      <p id="main">Hello World</p>
      <h4>Hello World</h4>
    `;
  }
}
