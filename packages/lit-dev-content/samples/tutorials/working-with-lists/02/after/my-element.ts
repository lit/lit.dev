import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  members = ['Peter', 'Lois', 'Meg', 'Chris', 'Stewie'];

  @property({attribute: false})
  pets = ['Brian'];

  @state()
  includePets = true;

  @state()
  includeSeparator = true;

  render() {
    const templates = [];
    for (const member of this.members) {
      templates.push(html`<li>${member}</li>`);
    }
    if (this.includeSeparator) {
      templates.push('🐶 Pets 🐱');
    }
    if (this.includePets) {
      for (const pet of this.pets) {
        templates.push(html`<li>${pet}</li>`);
      }
    }

    return html`
      <button @click=${() => this._togglePetVisibility()}>${this.includePets ? 'Hide' : 'Show'} pets</button>
      <button @click=${() => this._toggleSeparator()}>${this.includeSeparator ? 'Hide' : 'Show'} separator</button>
      <p>My family</p>
      <ul>
        ${templates}
      </ul>
    `;
  }

  private _togglePetVisibility() {
    this.includePets = !this.includePets;
  }

  private _toggleSeparator() {
    this.includeSeparator = !this.includeSeparator;
  }
}
