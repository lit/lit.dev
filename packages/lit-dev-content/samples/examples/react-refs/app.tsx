import type {EventName} from '@lit-labs/react';
import type {StateEvent} from './wander-boids.js';

import {createComponent} from '@lit-labs/react';
import {React} from './react.js';
import {WanderBoids as WanderBoidsWC} from './wander-boids.js';

/*
  The WanderBoid component is stateful and uncontrolled.
  So we want to react to changes in it's state.
  We do that through callbacks and refs
*/
const WanderBoid = createComponent(
  React,
  'wander-boids',
  WanderBoidsWC, 
  {
    onComponentState: 'state-event' as EventName<CustomEvent<StateEvent>>,
  }
);

const defaultAppState: StateEvent = {
  isPlaying: false,
  fps: 24,
};

export const App = () => {
  const boidRef = React.useRef();

  const [state, setState] = React.useState(defaultAppState);

  const play = React.useCallback(() => {
    boidRef.current?.play();
  }, []);

  const pause = React.useCallback(() => {
    boidRef.current?.pause();
  }, []);

  const onChange = React.useCallback((e) => {
    if (boidRef.current === null) {
      return;
    }
    boidRef.current.fps = e.target.value;
  }, []);

  const onComponentState = React.useCallback((e: CustomEvent<StateEvent>) => {
    if (boidRef.current === null) {
      return;
    }
    setState(e.detail);
  }, []);

  return (
    <>
      <WanderBoid
        onComponentState={onComponentState}
        ref={boidRef}
      ></WanderBoid>
      <div>
        <button disabled={state.isPlaying ? true : ''} onClick={play}>
          play
        </button>
        <button disabled={state.isPlaying ? '' : true} onClick={pause}>
          pause
        </button>
        <input
          onChange={onChange}
          type="range"
          value={state.fps}
          min="6"
          max="35"
        ></input>
      </div>
    </>
  );
};
