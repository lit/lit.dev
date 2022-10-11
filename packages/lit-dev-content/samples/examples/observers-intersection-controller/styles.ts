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
    transition: all 1s ease-out, background-color 0.5s ease-out;
    scale: 1;
    rotate: var(--rotation, 0turn);
  }
  .hidden {
    opacity: 0.35;
    scale: 0.35;
    rotate: 0turn;
    width: var(--size);
    height: var(--size);
  }
  /* Shapes */
  .circle,
  .square,
  .triangle.hidden,
  .triangle-corner.hidden {
    width: var(--size);
    height: var(--size);
    background-color: var(--color);
  }
  .circle {
    border-radius: 50%;
  }
  .circle.hidden {
    border-radius: 0%;
  }
  .triangle,
  .triangle-corner {
    width: 0;
    height: 0;
    background-color: unset;
  }
  .triangle {
    border-left: calc(var(--size) / 2) solid transparent;
    border-right: calc(var(--size) / 2) solid transparent;
    border-bottom: var(--size) solid var(--color);
  }
  .triangle.hidden {
    border-left: 0px solid transparent;
    border-right: 0px solid transparent;
    border-bottom: 0px solid var(--color);
  }
  .triangle-corner {
    border-top: var(--size) solid var(--color);
    border-right: var(--size) solid transparent;
  }
  .triangle-corner.hidden {
    border-top: 0px solid var(--color);
    border-right: 0px solid transparent;
  }
`;
