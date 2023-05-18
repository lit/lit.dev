import React from 'react';
import {createRoot} from 'react-dom/client';
import './simple-slots.js';

export const App = () => (
  <simple-slots>
    <p slot="head">This element will be projected onto the "head" slot.</p>
    <p slot="tail">This element will be projected onto the "tail" slot.</p>
    <div slot="tail">
      <Foo />
    </div>
    <p>
      Elements without a slot attribute will be projected onto the default
      slot.
    </p>
  </simple-slots>
);

const Foo = () =>
  <>
    React Components must be a descendant of an element
    with a slot attribute otherwise they will be projected
    onto the default slot.
  </>;

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
