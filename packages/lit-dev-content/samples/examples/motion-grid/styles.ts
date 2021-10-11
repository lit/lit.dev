import {css} from 'lit';

export const styles = [
  css`
    .container {
      display: grid;
      height: 100vh;
      width: 100vw;
    }

    .container.layout0 {
      grid-template-areas:
        'a a a a a a'
        'b c c c c d'
        'b c c c c d'
        'b c c c c d'
        'b c c c c d'
        'b c c c c d'
        'e e e e e e';
    }

    .container.layout2 {
      grid-template-areas:
        'b a a a a d'
        'b c c c c d'
        'b c c c c d'
        'b c c c c d'
        'b c c c c d'
        'b c c c c d'
        'b e e e e d';
    }

    .container.layout1 {
      grid-template-areas:
        'a a c c c c'
        'a a c c c c'
        'a a d d d d'
        'b b d d d d'
        'b b e e e e'
        'b b e e e e';
    }

    .container.layout3 {
      grid-template-areas:
        'a a a a c c'
        'a a a a c c'
        'a a a a d d'
        'b b b b d d'
        'b b b b e e'
        'b b b b e e';
    }

    .item0 {
      grid-area: a;
      background: #002171;
    }
    .item1 {
      grid-area: b;
      background: #5472d3;
    }
    .item2 {
      grid-area: c;
      background: #e1e2e1;
    }
    .item3 {
      grid-area: d;
      background: #7f0000;
    }
    .item4 {
      grid-area: e;
      background: #560027;
    }

    .message {
      position: absolute;
      top: 1em;
      left: 1em;
      color: #aaa;
      font-style: italic;
      font-weight: bold;
      font-size: 2em;
    }
  `,
];
