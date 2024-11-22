import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

export type ScoreEvent = CustomEvent<number>;

@customElement('game-player')
export class GamePlayer extends LitElement {
  render() {
    return html`
      <button @click=${() => this.handleScore(7)}>Touchdown!</button>
      <button @click=${() => this.handleScore(3)}>Field goal!</button>
    `;
  }

  handleScore(points: number) {
    this.dispatchEvent(new CustomEvent('score', { detail: points, bubbles: true }));
  }
}