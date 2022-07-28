import type {EventName} from '@lit-labs/react';

import {React} from './react.js';
import {createComponent} from '@lit-labs/react';
import {SecretButton as SecretButtonComponent} from './secret-button.js';

const {useCallback, useState} = React;

const SecretButton = createComponent(
  React,
  'secret-button',
  SecretButtonComponent,
  {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>}
);

export const App = () => {
  const [message, setMessage] = useState(
    'Click the button to recieve a custom event dispatched by the SecretButton component.'
  );

  const onSecretMessageCallback = useCallback(
    (e: CustomEvent<string>) => setMessage(e.detail),
    []
  );

  return (
    <>
      <SecretButton onSecretMessage={onSecretMessageCallback}></SecretButton>
      <div>{message}</div>
    </>
  );
};
