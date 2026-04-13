import { html, LitElement, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() counter = 0

  firstUpdated() {
    setInterval(() =>  this.counter += 1 , 1000);
  }

  render() {
    const classes = {
      red: this.counter % 2 === 0,
      blue: this.counter % 2 === 1
    };
    return html`<p class=${classMap(classes)}>Hello!</p>`;
  }

  static styles = css`
    .red {
      color: red;
    }
    .blue {
      color: blue;
    }
  `;
}