import type {EventName} from "@lit-labs/react";

import {
  React,
  ReactDOM,
  SecretButton as SecretButtonComponent,
} from "./deps.js";
import {createComponent} from "@lit-labs/react";

const SecretButton = createComponent(
  React,
  'secret-button',
  SecretButtonComponent,
  {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>},
);

const App = () => {
  const [message, setMessage] = React.useState(
    "click the button for a secret message :D",
  );

  const clickCallback = React.useCallback(
    (e: CustomEvent<string>) => setMessage(e.detail),
    [message, setMessage],
  )

  return (
    <>
        <div>{message}</div>
        <SecretButton onSecretMessage={clickCallback}></SecretButton>
    </>
  )
};

const section = document.querySelector('section')
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);