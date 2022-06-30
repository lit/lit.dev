import {React} from "./deps.js";
import {createComponent} from "@lit-labs/react";
import {Button} from '@material/mwc-button';


const MWCButton = createComponent(
  React,
  'mwc-button',
  Button,
)

const App = () => {
  const [count, setCount] = React.useState(0);
  
  const clickCallback = React.useCallback((e) => {
   setCount(count + 1);
  }, [count, setCount])

 return (
    <>
        <div>There have been {count} clicks!</div>
        <MWCButton
            onClick={clickCallback}
            outlined="${true}">Increase count ++</MWCButton>
    </>
  )
};


export { App };