import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element';
import { property } from 'lit/decorators/property';

@customElement('my-element')
export class MyElement extends LitElement {
  @property() greeting = "Welcome";
  @property() name = "Sally";
  @property({type: Boolean}) emphatic = true;
  render() {
    return html`${this.greeting} ${this.name}${this.emphatic ? '!' : '.'}`;
  }
}
