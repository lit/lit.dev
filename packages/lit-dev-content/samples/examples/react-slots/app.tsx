import {React, ReactDOM} from './react.js';
import {createComponent} from '@lit-labs/react';
import {SimpleSlots as SimpleSlotsWC} from './simple-slots.js';

const SimpleSlots = createComponent(React, 'simple-slots', SimpleSlotsWC);

export const App = () => (
  <SimpleSlots>
    <p slot="head">This element will be projected onto the "head" slot.</p>
    <p slot="tail">This element will be projected onto the "tail" slot.</p>
    <div slot="tail">
      <Foo></Foo>
    </div>
    <p>
      Elements without a slot attribute will be projected onto the default
      slot.
    </p>
  </SimpleSlots>
);

const Foo = () =>
  <>
    React Components must be a descendant of an element
    with a slot attribute otherwise they will be projected
    onto the default slot.
  </>;

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<App></App>);
