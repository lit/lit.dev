import {React, Button as ButtonWC} from "./deps.js";
import {createComponent} from "@lit-labs/react";

const Button = createComponent(
  React,
  'demo-button',
  ButtonWC,
)

const App = () => {
  const [count, setCount] = React.useState(0);
  
  const clickCallback = React.useCallback((e) => {
   setCount(count + 1);
  }, [count, setCount])

 return (
    <>
        <div>There have been {count} clicks!</div>
        <Button
            onClick={clickCallback}>click ++</Button>
    </>
  )
};

export { App };