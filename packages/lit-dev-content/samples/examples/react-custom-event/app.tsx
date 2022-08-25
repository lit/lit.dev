import type {EventName} from '@lit-labs/react';

import {React, ReactDOM} from './react.js';
import {createComponent} from '@lit-labs/react';
import {SecretButton as SecretButtonWC} from './secret-button.js';

const {useCallback, useState} = React;

const SecretButton = createComponent(
  React,
  'secret-button',
  SecretButtonWC,
  {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>}
);

export const App = () => {
  const [message, setMessage] = useState(
    `Click the button to recieve a custom event
      dispatched by the SecretButton component.`
  );

  const onSecretMessage = useCallback(
    (e: CustomEvent<string>) => setMessage(e.detail),
    []
  );

  return (
    <>
      <SecretButton onSecretMessage={onSecretMessage}></SecretButton>
      <div>{message}</div>
    </>
  );
};

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<App></App>);
