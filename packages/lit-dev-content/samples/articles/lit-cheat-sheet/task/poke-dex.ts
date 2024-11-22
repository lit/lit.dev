import { html, LitElement } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import type { PokedexEntry } from './poke-types.js';
import { Task } from '@lit/task';

@customElement('poke-dex')
export class MyElement extends LitElement {
  @state() pokemonId = 1;
  @state() autoplay = false;
  @query('input') input!: HTMLInputElement;

  #pokemonTask = new Task(
    this,
    async ([pokemonId]) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<PokedexEntry>;
    },
    () => [this.pokemonId]
  );


  render() {
    return html`
      ${this.#renderControls()}
      ${
        this.#pokemonTask.render({
          initial: () => html`<p>Enter a pokemon ID and click "Fetch"</p>`,
          pending: () => html`<p>Loading ID ${this.pokemonId}...</p>`,
          complete: (pokemon) => html`
            <h2>${pokemon.name}</h2>
            <p>Height: ${pokemon.height}</p>
            <p>Weight: ${pokemon.weight}</p>
            <p>Types: ${pokemon.types.map(({type}) => type.name).join(', ')}</p>
            <audio controls ?autoplay=${this.autoplay} src=${pokemon.cries.latest}></audio>
          `,
          error: (error) => html`<p>Error fetching ID ${this.pokemonId}: ${error}</p>`,
        })
      }
    `;
  }

  #updateId() {
    /* playground-fold */
    this.pokemonId = Number(this.input.value);
  }

  #renderControls() {
    return html`
      <div>
        <label>
          Pokemon id number:
          <input type="number" value=${this.pokemonId} @keypress=${this.#onKeypress} />
        </label>
        <button @click=${this.#updateId}>Fetch</button>
      </div>
      <label style="display: block;">
        Autoplay sound?
        <input type="checkbox" @input=${() => {this.autoplay = !this.autoplay}} .checked=${this.autoplay} />
      </label>
    `;
  }

  #onKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.#updateId();
    }
    /* playground-fold-end */
  }
}
