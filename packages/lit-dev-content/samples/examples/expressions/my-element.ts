import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property()
  bodyText = 'Text in child expression.';
  @property()
  label = 'A label, for ARIA.';
  @property()
  editing = true;
  @property()
  value = 7;

  render() {
    return html`
      <!-- Child  expression -->
      <div>Child expression: ${this.bodyText}</div>

      <!-- attribute expression -->
      <div aria-label=${this.label}>Attribute expression.</div>

      <!-- Boolean attribute expression -->
      <div>
        Boolean attribute expression.
        <input type="text" ?disabled=${!this.editing} />
      </div>

      <!-- property expression -->
      <div>
        Property expression.
        <input type="number" .valueAsNumber=${this.value} />
      </div>

      <!-- event listener expression -->
      <div>
        Event listener expression.
        <button @click="${this.clickHandler}">Click</button>
      </div>
    `;
  }
  clickHandler(e: Event) {
    this.editing = !this.editing;
    console.log(e.target);
  }
}
