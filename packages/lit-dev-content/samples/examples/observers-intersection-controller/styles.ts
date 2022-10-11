import {css} from 'lit';

export const styles = css`
  #parallax {
    perspective: 1px;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: scroll;
    perspective-origin: 100%;
  }

  div {
    transition: all 1s ease;
    scale: 1;
    rotate: var(--rotation, 0turn);
  }

  .hidden {
    opacity: 0.25;
    scale: 0.5;
    rotate: 0turn;
  }

  /* Shapes */
  .square,
  .circle {
    background-color: var(--color);
    width: var(--size);
    height: var(--size);
  }

  .circle {
    border-radius: 50%;
  }

  .triangle {
    border-left: calc(var(--size) / 2) solid transparent;
    border-right: calc(var(--size) / 2) solid transparent;
    border-bottom: var(--size) solid var(--color);
  }

  .triangle-corner {
    border-top: var(--size) solid var(--color);
    border-right: var(--size) solid transparent;
  }
`;
