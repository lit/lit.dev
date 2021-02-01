// TODO: update with Lit2 import location
import { LitElement, html, customElement, property } from '@polymer/lit-element';
@customElement('my-element')
class MyElement extends LitElement {
  @property() greeting = "Welcome";
  @property() name = "Sally";
  @property({type: Boolean}) emphatic = true;
  render() {
    return html`${this.greeting} ${this.name}${this.emphatic ? '!' : '.'}`;
  }
}
