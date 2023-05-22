import React from 'https://esm.sh/react@18';
import {createRoot} from 'https://esm.sh/react-dom@18/client';
import {createComponent} from '@lit-labs/react';
import {CounterButton as CounterButtonWC} from './counter-button.js';

const CounterButton = createComponent({
  react: React,
  tagName: 'counter-button',
  elementClass: CounterButtonWC,
});

const App = () => {
  const [count, setCount] = React.useState(0);

  return <CounterButton onClick={() => setCount((c) => c + 1)} count={count} />;
};

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
