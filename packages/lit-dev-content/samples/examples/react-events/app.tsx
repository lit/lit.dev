import React from 'https://esm.sh/react@18';
import {createRoot} from 'https://esm.sh/react-dom@18/client';
import {createComponent} from '@lit-labs/react';
import {ClickRoulette as ClickRouletteWC} from './click-roulette.js';

const ClickRoulette = createComponent({
  react: React,
  tagName: 'click-roulette',
  elementClass: ClickRouletteWC,
  // Defines props that will be event handlers for the named events
  events: {
    onBang: 'bang',
    onReset: 'reset',
  },
});

const App = () => {
  const [message, setMessage] = React.useState('😬');

  const handleBang = () => {
    setMessage('😵');
  };

  const handleReset = () => {
    setMessage('😬');
  };

  return (
    <main>
      <h1> Let's play Click Roulette!</h1>
      <ClickRoulette onBang={handleBang} onReset={handleReset} />
      <p>{message}</p>
    </main>
  );
};

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
