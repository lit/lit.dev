import {createComponent} from '@lit-labs/react';

import {React, ReactDOM, CounterButton as CounterButtonWC} from './deps.js';

const CounterButton = createComponent(React, 'counter-button', CounterButtonWC);

const App = () => {
  const [count, setCount] = React.useState(0);

  const clickCallback = React.useCallback((e) => setCount(count + 1), [count]);

  return <CounterButton onClick={clickCallback} count={count}></CounterButton>;
};

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);
