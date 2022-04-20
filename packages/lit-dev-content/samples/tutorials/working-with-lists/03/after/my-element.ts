import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

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
    const listItems = [];
    for (const friend of this.friends) {
      listItems.push(html`<li>${friend}</li>`);
    }
    if (this.includePets) {
      for (const pet of this.pets) {
        listItems.push(html`<li>${pet.name} (${pet.species})</li>`);
      }
    }

    return html`
      <button @click=${() => this._togglePetVisibility()}>
        ${this.includePets ? 'Hide' : 'Show'} pets
      </button>
      <p>My magical friends</p>
      <ul>
        ${listItems}
      </ul>
    `;
  }

  private _togglePetVisibility() {
    this.includePets = !this.includePets;
  }
}
