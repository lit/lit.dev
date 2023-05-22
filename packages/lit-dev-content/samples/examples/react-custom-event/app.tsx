import React from 'https://esm.sh/react@18';
import {createRoot} from 'https://esm.sh/react-dom@18/client';
import {createComponent, EventName} from '@lit-labs/react';
import {SecretButton as SecretButtonWC} from './secret-button.js';

const SecretButton = createComponent({
  react: React,
  tagName: 'secret-button',
  elementClass: SecretButtonWC,
  events: {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>},
});

const App = () => {
  const [message, setMessage] = React.useState(
    `Click the button to recieve a custom event
      dispatched by the SecretButton component.`
  );

  return (
    <>
      <SecretButton onSecretMessage={(e) => setMessage(e.detail)} />
      <div>{message}</div>
    </>
  );
};

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
