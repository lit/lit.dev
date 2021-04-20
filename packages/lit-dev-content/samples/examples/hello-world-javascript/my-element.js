import { LitElement, html, css } from 'lit';

export class MyElement extends LitElement {
  // Styles are scoped to this element; won't conflict with styles
  // on page or in other components. Styling API can be exposed via
  // CSS custom properties.
  static get styles() {
    return css`
      :host {
        display: inline-block;
        padding: 10px;
        background: lightgray;
      }
      .planet {
        color: var(--planet-color, blue);
      }
    `
  };

  // Define reactive properties--updating a reactive property causes
  // the component to update.
  static get properties() {
    return {
      greeting: { type: String },
      planet: { type: String }
    }
  };

  constructor() {
    super();
    // Default values for reactive properties may be set in the constructor
    this.greeting = 'Hello';
    this.planet = 'World';
  }

  // The render() method is called any time reactive properties change.
  // Return HTML in a string template literal tagged with the `html`
  // tag function to describe the component's internal DOM.
  // Expressions can set attribute values, proeprty values, event handlers,
  // and child nodes/text.
  render() {
    return html`
      <span @click=${this.togglePlanet}
        >${this.greeting}
        <span class="planet">${this.planet}</span>
      </span>
    `;
  }

  // Event handlers can update the state of properties on the element
  // instance, causing it to re-render
  togglePlanet() {
    this.planet = this.planet === "World" ? "Mars" : "World";
  }
}
customElements.define("my-element", MyElement);
