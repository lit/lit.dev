import React from 'https://esm.sh/react@18';
import {createRoot} from 'https://esm.sh/react-dom@18/client';
import {SimpleSlots as SimpleSlotsWC} from './simple-slots.js';
import {createComponent} from '@lit/react';

const SimpleSlots = createComponent({
  react: React,
  tagName: 'simple-slots',
  elementClass: SimpleSlotsWC,
});

const App = () => (
  <SimpleSlots>
    <p slot="head">This element will be projected onto the "head" slot.</p>
    <p slot="tail">This element will be projected onto the "tail" slot.</p>
    <div slot="tail">
      <Foo />
    </div>
    <p>
      Elements without a slot attribute will be projected onto the default slot.
    </p>
  </SimpleSlots>
);

const Foo = () => (
  <>
    React Components must be a descendant of an element with a slot attribute
    otherwise they will be projected onto the default slot.
  </>
);

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
