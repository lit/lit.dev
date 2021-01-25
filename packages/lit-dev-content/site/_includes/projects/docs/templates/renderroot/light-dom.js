import { LitElement, html } from 'lit-element';

class LightDom extends LitElement {
  /**
   * To customize an element's render root, implement createRenderRoot. Return
   * the node into which to render the element's template.
   *
   * This element renders without shadow DOM.
   */
  createRenderRoot(){
    return this;
  }
  render(){
    return html`
      <p><b>Render root overridden.</b> Template renders without shadow DOM.</p>
    `;
  }
}
customElements.define('light-dom', LightDom);
