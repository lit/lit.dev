import {createComponent} from '@lit-labs/react';

import {React, LyricalSlots as LyricalSlotsWC} from './deps.js';

const LyricalSlots = createComponent(React, 'lyrical-slots', LyricalSlotsWC);

export const App = () => {
  return (
    <>
      <LyricalSlots>
        <div slot="clowns">&#129313; &#129313; &#129313;</div>
        <div slot="jokers">&#127183; &#127183; &#127183;</div>
      </LyricalSlots>
    </>
  );
};
