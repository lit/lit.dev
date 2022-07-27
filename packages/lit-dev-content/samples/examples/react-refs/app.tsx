import {createComponent} from '@lit-labs/react';
import {React} from "./react.js";
import {WanderBoids as WanderBoidsWC} from './wander-boids.js';

/*
  The WanderBoid component is stateful and uncontrolled.
  So we want to react to changes in it's state.
  We do that through callbacks and refs
*/
const WanderBoid = createComponent(React, 'wander-boids', WanderBoidsWC);

export const App = () => {
  const boidRef = React.useRef();

  const play = React.useCallback(() => {
    boidRef?.current.play();
  }, [boidRef]);

  const pause = React.useCallback(() => {
    boidRef?.current.pause();
  }, [boidRef]);

  const onChange = React.useCallback((e) => {
    if (boidRef.current === null) {
      return;
    }
    boidRef.current.fps = e.target.value;
  }, [boidRef]);

  return (
    <>
      <WanderBoid ref={boidRef}>
      </WanderBoid>
      <div>
        <button onClick={play}>play</button>
        <button onClick={pause}>pause</button>
        <input onChange={onChange} type="range" min="6" max="35"></input>
      </div>
    </>
  )
}
