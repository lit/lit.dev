import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './game-player.js';
import type {ScoreEvent} from './game-player.js';

@customElement('score-board')
export class ScoreBoard extends LitElement {
  @state() playerOneScore = 0;
  @state() playerTwoScore = 0;

  render() {
    return html`
      <h1>${this.playerOneScore} - ${this.playerTwoScore}</h1>
      <h2>Player 1</h2>
      <game-player @score=${(e: ScoreEvent) => this.playerOneScore += e.detail}></game-player>
      <h2>Player 2</h2>
      <game-player @score=${(e: ScoreEvent) => this.playerTwoScore += e.detail}></game-player>
    `;
  }
}