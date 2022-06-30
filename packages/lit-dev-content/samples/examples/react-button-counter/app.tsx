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
  const [state, setState] = useState(0);
  const clickCallback = useCallback((e) => {
   setState(state + 1);
  }, [state, setState])

 return (
    <>
        <div> you clicked: {state} clicks</div>
        <MWCButton
            onClick={clickCallback}
            outlined="${true}">CLICK ME!</MWCButton>
    </>
  )
};