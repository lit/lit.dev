import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {TemplateResult} from 'lit';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  friends = ['Harry', 'Ron', 'Hermione'];

  @property({attribute: false})
  pets = [
    { name: "Hedwig", species: "Owl" },
    { name: "Scabbers", species: "Rat" },
    { name: "Crookshanks", species: "Cat" },
  ];

  @state()
  includePets = true;

  render() {
    const listItems: TemplateResult[] = [];
    // TODO: populate templates with items to render.

    return html`
      <button @click=${() => this._togglePetVisibility()}>
        ${this.includePets ? 'Hide' : 'Show'} pets
      </button>
      <p>My magical friends</p>
      <ul>
        <!-- TODO: Render templates. -->
      </ul>
    `;
  }

  private _togglePetVisibility() {
    this.includePets = !this.includePets;
  }
}
