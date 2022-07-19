import {createComponent} from '@lit-labs/react';
import {React} from "./faux-react.js";
import {LyricalSlots as LyricalSlotsWC} from './lyrical-slots.js';

const LyricalSlots = createComponent(React, 'lyrical-slots', LyricalSlotsWC);

export const App = () => (
  <>
    <LyricalSlots>
      <div slot="clowns">&#129313; &#129313; &#129313;</div>
      <div slot="jokers">&#127183; &#127183; &#127183;</div>
    </LyricalSlots>
  </>
);
