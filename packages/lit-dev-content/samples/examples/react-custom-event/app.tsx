import type {EventName} from "@lit-labs/react";

import {createComponent} from "@lit-labs/react";
import {React, SecretMessageButton as  SecretMessageButtonWC} from "./deps.js";

const {useState, useCallback} = React;

const SecretMessageButton = createComponent(
  React,
  'secret-message-button',
  SecretMessageButtonWC,
  {onSecretMessage: 'secret-message' as EventName<CustomEvent<string>>},
)

export const App = () => {
  const [count, setCount] = useState("you haven't clicked yet!");
  const clickCallback = useCallback((e: CustomEvent<string>) => {
    console.log(e);
    setCount(e.detail);
    
  }, [count, setCount])

 return (
    <>
        <SecretMessageButton onSecretMessage={clickCallback}></SecretMessageButton>
        <div>The secret message is:</div>
        <div>{count}</div>
    </>
  )
};