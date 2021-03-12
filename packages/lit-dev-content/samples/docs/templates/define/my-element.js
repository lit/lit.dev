import {LitElement, html, customElement} from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {

  render(){
    return html`<p>template content</p>`;
  }
}
