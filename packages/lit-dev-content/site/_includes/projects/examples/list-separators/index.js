import {html, render, nothing} from 'lit-html';

const items = ['A', 'B', 'C', 'D'];

const myTemplate = items =>
  items.map((item, i) => [
    // This is the value we want to render
    html`
      <span>${item}</span>
    `,
    // This is the separator, or nothing for the last item
    i < items.length - 1 ? ', ' : nothing
  ]);

render(myTemplate(items), document.body);
