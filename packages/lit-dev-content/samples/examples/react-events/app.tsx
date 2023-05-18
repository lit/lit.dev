import React, {useCallback, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './counter-button.js';

export const App = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => setCount((c) => c + 1), []);

  // React supports basic events and serializable props for custom elements
  return <counter-button onClick={handleClick} count={count}></counter-button>;
};

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
