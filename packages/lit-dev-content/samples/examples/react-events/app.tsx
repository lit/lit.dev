import {React, ReactDOM} from './react.js';
import {createComponent} from '@lit-labs/react';
import {CounterButton as CounterButtonWC} from './counter-button.js';

const CounterButton = createComponent({
  react: React,
  tagName: 'counter-button',
  elementClass: CounterButtonWC,
});

const {useCallback, useState} = React;

export const App = () => {
  const [count, setCount] = useState(0);

  const onClick = useCallback(() => setCount(count + 1), [count]);

  return <CounterButton onClick={onClick} count={count}></CounterButton>;
};

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<App></App>);
