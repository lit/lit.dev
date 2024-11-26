import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { playerOneScore, playerTwoScore } from './game-state.js';

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
    if (this.getAttribute('player') === 'two') {
      playerTwoScore.set(playerTwoScore.get() + points);
    } else {
      playerOneScore.set(playerOneScore.get() + points);
    }
  }
}
