import {createComponent} from '@lit-labs/react';
import {React} from './react.js';
import {CounterButton as CounterButtonWC} from './counter-button.js';

const CounterButton = createComponent(React, 'counter-button', CounterButtonWC);

const {useCallback, useState} = React;

export const App = () => {
  const [count, setCount] = useState(0);

  const clickCallback = useCallback(() => setCount(count + 1), [count]);

  return <CounterButton onClick={clickCallback} count={count}></CounterButton>;
};
