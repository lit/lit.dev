import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {cache} from 'lit/directives/cache.js';

const view1 = () => html`View 1: <input value="edit me then toggle">`;
const view2 = () => html`View 2: <input value="edit me then toggle">`;

@customElement('my-element')
export class MyElement extends LitElement {

  @property({type: Number})
  selectedView = 1;

  render() {
    return html`
      <h3>cache directive example</h3>

      <button @click=${this.toggleView}>Toggle View</button><hr>

      Un-cached (DOM re-created when template re-rendered):<br>
      ${this.selectedView == 1 ? view1() : view2()}<hr>

      Cached (DOM cached and re-used when template re-rendered):<br>
      ${cache(this.selectedView == 1 ? view1() : view2())}
    `;
  }

  private toggleView() {
    this.selectedView = this.selectedView === 1 ? 2 : 1;
  }
}
