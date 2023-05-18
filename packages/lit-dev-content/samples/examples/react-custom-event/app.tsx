import React, {useCallback, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createComponent, EventName} from '@lit-labs/react';
import {SecretButton as SecretButtonWC} from './secret-button.js';

const SecretButton = createComponent({
  react: React,
  tagName: 'secret-button',
  elementClass: SecretButtonWC,
  events: {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>}
});

export const App = () => {
  const [message, setMessage] = useState(
    `Click the button to recieve a custom event
      dispatched by the SecretButton component.`
  );

  const handleSecretMessage = useCallback(
    (e: CustomEvent<string>) => setMessage(e.detail),
    []
  );

  return (
    <>
      <SecretButton onSecretMessage={handleSecretMessage}></SecretButton>
      <div>{message}</div>
    </>
  );
};

const root = createRoot(document.getElementById('app')!);

root.render(<App></App>);
