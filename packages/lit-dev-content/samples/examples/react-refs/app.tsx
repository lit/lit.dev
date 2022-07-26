import {createComponent} from '@lit-labs/react';
import {React} from "./faux-react.js";
import {WanderBoid as WanderBoidWC} from './wander-boid.js';

const WanderBoid = createComponent(React, 'wander-boid', WanderBoidWC);

export const App = () => {
  const wanderBoidRef = React.useRef();

  const play = React.useCallback(() => {
    wanderBoidRef?.current.play();
  }, [wanderBoidRef]);

  const pause = React.useCallback(() => {
    wanderBoidRef?.current.pause();
  }, [wanderBoidRef]);

  return (
    <>
      <WanderBoid ref={wanderBoidRef}>
      </WanderBoid>
      <div>
        <button onClick={play}>play</button>
        <button onClick={pause}>pause</button>
      </div>
    </>
  )
}
