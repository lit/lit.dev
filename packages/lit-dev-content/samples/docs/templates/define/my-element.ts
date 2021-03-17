import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators';

@customElement('my-element')
class MyElement extends LitElement {

  render(){
    return html`<p>Hello from my template.</p>`;
  }
}
