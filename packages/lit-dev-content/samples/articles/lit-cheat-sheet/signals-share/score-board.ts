import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './game-player.js';
import { SignalWatcher, html } from '@lit-labs/signals';
import { playerOneScore, playerTwoScore } from './game-state.js';

@customElement('score-board')
export class ScoreBoard extends SignalWatcher(LitElement) {
  render() {
    return html`
      <h1>${playerOneScore} - ${playerTwoScore}</h1>
      <h2>Player 1</h2>
      <game-player player="one"></game-player>
      <h2>Player 2</h2>
      <game-player player="two"></game-player>
    `;
  }
}
