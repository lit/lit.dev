import { LitElement, html, css } from "lit-element";

export class MyElement extends LitElement {
  // Styles are scoped to this element; won't conflict with styles
  // on page or in other components. Styling API can be exposed via
  // CSS custom properties.
  static styles = css`
    :host {
      display: inline-block;
      padding: 10px;
      background: lightgray;
    }
    .planet {
      color: var(--planet-color, blue);
    }
  `;

  // Properties denote reactive properties that can be used in rendering
  // They can be set via HTML attributes and updated dynamically by
  // setting their property
  static properties = {
    greeting: { type: String },
    planet: { type: String }
  };

  constructor() {
    super();
    // Default values for reactive properties may be set in the constructor
    this.greeting = "Hello";
    this.planet = "World";
  }

  // The render() method is called any time reactive properties change.
  // Return HTML in a string template literal tagged with the `html`
  // tag function to describe the DOM to efficiently render using lit-html.
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

  // Event handlers can update the state of @properties on the element
  // instance, causing it to re-render
  togglePlanet() {
    this.planet = this.planet === "World" ? "Mars" : "World";
  }
}
customElements.define("my-element", MyElement);

// Learn more at https://lit-element.polymer-project.org/guide
