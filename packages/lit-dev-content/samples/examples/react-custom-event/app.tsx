import type {EventName} from '@lit-labs/react';
import {createComponent} from '@lit-labs/react';
import {React, SecretButton as SecretButtonComponent} from './deps.js';

const SecretButton = createComponent(
  React,
  'secret-button',
  SecretButtonComponent,
  {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>}
);

const {useCallback, useState} = React;

export const App = () => {
  const [message, setMessage] = useState(
    'click the button for a secret message :D'
  );

  const clickCallback = useCallback(
    (e: CustomEvent<string>) => setMessage(e.detail),
    []
  );

  return (
    <>
      <SecretButton onSecretMessage={clickCallback}></SecretButton>
      <div>{message}</div>
    </>
  );
};
