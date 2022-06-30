import {createComponent} from "@lit-labs/react";
import {Button} from '@material/mwc-button';
import {React} from "./deps.js";

const {useState, useCallback} = React;

const MWCButton = createComponent(
  React,
  'mwc-button',
  Button,
)

export const App = () => {
  const [count, setCount] = useState(0);
  const clickCallback = useCallback((e) => {
   setCount(count + 1);
  }, [count, setCount])

 return (
    <>
        <div>There have been {count} clicks!</div>
        <MWCButton
            onClick={clickCallback}
            outlined="${true}">CLICK ME!</MWCButton>
    </>
  )
};