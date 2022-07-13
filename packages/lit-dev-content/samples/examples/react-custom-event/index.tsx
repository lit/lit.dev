import type {EventName} from '@lit-labs/react';
import {createComponent} from '@lit-labs/react';

import {
  React,
  ReactDOM,
  SecretButton as SecretButtonComponent,
} from './deps.js';

const SecretButton = createComponent(
  React,
  'secret-button',
  SecretButtonComponent,
  {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>}
);

const App = () => {
  const [message, setMessage] = React.useState(
    'click the button for a secret message :D'
  );

  const clickCallback = React.useCallback(
    (e: CustomEvent<string>) => setMessage(e.detail),
    [message]
  );

  return (
    <>
      <SecretButton onSecretMessage={clickCallback}></SecretButton>
      <div>{message}</div>
    </>
  );
};

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);
