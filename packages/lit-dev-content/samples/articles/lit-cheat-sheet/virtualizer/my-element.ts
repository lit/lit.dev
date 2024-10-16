import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@lit-labs/virtualizer';

@customElement('my-element')
export class MyItems extends LitElement {
  data = new Array(10000).fill('').map((i, n) => ({text: `Item ${n}`}));

  render() {
    return html`
      <ul>
        <!--
          NOTE: you can also use the virtualize() directive so that you don't
          have the lit-virtualizer element as a wrapper
        -->
        <lit-virtualizer
            .items=${this.data}
            .renderItem=${(i: {text: string}) => html`<li>${i.text}</li>`}>
        </lit-virtualizer>
      </ul>
    `;
  }
}
