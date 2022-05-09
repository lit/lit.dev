import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {TemplateResult} from 'lit';

@customElement('my-element')
class MyElement extends LitElement {
  @state()
  friends = ['Harry', 'Ron', 'Hermione'];

  @state()
  pets = [
    { name: "Hedwig", species: "Owl" },
    { name: "Scabbers", species: "Rat" },
    { name: "Crookshanks", species: "Cat" },
  ];

  @state()
  includePets = true;

  render() {
    const listItems: TemplateResult[] = [];
    this.friends.forEach((friend) => {
      listItems.push(html`<li>${friend}</li>`);
    });
    if (this.includePets) {
      this.pets.forEach((pet) => {
        listItems.push(html`<li>${pet.name} (${pet.species})</li>`);
      });
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
