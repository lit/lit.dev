import type {EventName} from "@lit-labs/react";

import {
  React,
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
  const [message, setMessage] = React.useState("you haven't clicked yet!");
  const clickCallback = React.useCallback((e: CustomEvent<string>) => {
    setMessage(e.detail);
  }, [message, setMessage])

  return (
    <>
        <SecretButton onSecretMessage={clickCallback}></SecretButton>
        <div>The secret message is:</div>
        <div>{message}</div>
    </>
  )
};


export { App };