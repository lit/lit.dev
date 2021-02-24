import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators';
import { classMap } from 'lit/directives/class-map';
import { styleMap } from 'lit/directives/style-map';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    .someclass { border: 1px solid red; padding: 4px; }
    .anotherclass { background-color: navy; }
  `;
  @property()
  classes = { someclass: true, anotherclass: true };
  @property()
  styles = { color: 'lightgreen', fontFamily: 'Roboto' };
  protected render() {
    return html`
      <div class=${classMap(this.classes)} style=${styleMap(this.styles)}>
        Some content
      </div>
    `;
  }
}
