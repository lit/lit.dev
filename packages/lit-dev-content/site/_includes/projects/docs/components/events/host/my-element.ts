import { LitElement, html, customElement, property } from '@polymer/lit-element';
@customElement('my-element')
class MyElement extends LitElement {
  @property() hostName = '';
  @property() shadowName = '';
  constructor() {
    super();
    this.addEventListener('click', (e: Event) => this.hostName = e.target.localName);
  }
  protected createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('click', (e: Event) => this.shadowName = e.target.localName);
    return root;
  }
  protected render() {
    return html`
      <p><button>Click Me!</button></p>
      <p>Component target: ${this.hostName}</p>
      <p>Shadow target: ${this.shadowName}</p>
    `;
  }
}
