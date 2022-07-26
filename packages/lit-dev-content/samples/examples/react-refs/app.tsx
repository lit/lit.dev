import {createComponent} from '@lit-labs/react';
import {React} from "./faux-react.js";
import {WanderBoids as WanderBoidsWC} from './wander-boids.js';

const WanderBoid = createComponent(React, 'wander-boid', WanderBoidsWC);

export const App = () => {
  const boidRef = React.useRef();

  const play = React.useCallback(() => {
    boidRef?.current.play();
  }, [boidRef]);

  const pause = React.useCallback(() => {
    boidRef?.current.pause();
  }, [boidRef]);

  return (
    <>
      <WanderBoid ref={boidRef}>
      </WanderBoid>
      <div>
        <button onClick={play}>play</button>
        <button onClick={pause}>pause</button>
      </div>
    </>
  )
}
