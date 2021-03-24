import {LitElement, html, css}  from 'lit';
import {customElement, property}  from 'lit/decorators.js';

@customElement("my-element")
export class MyElement extends LitElement {
  // Styles are scoped to this element: they won't conflict with styles
  // on the main page or in other components. Styling API can be exposed
  // via CSS custom properties.
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

  // @property denotes reactive properties that can be used in rendering
  // They can be set via HTML attributes in JavaScript by setting their
  // property
  @property() greeting = "Hello";
  @property() planet = "World";

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

  // Learn more at https://lit-element.polymer-project.org/guide
}
