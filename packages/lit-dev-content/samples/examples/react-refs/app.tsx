import type {EventName} from '@lit-labs/react';
import type {StateEvent} from './wander-boids.js';

import {createComponent} from '@lit-labs/react';
import {React} from "./react.js";
import {WanderBoids as WanderBoidsWC} from './wander-boids.js';

/*
  The WanderBoid component is stateful and uncontrolled.
  So we want to react to changes in it's state.
  We do that through callbacks and refs
*/
const WanderBoid = createComponent(React, 'wander-boids', WanderBoidsWC, {onStateEvent: 'state-event' as EventName<StateEvent>});

export const App = () => {
  const boidRef = React.useRef();

  const [state, setState] = React.useState({ isPlaying: false, fps: 24});

  const play = React.useCallback(() => {
    boidRef.current?.play();
  }, [boidRef]);

  const pause = React.useCallback(() => {
    boidRef.current?.pause();
  }, [boidRef]);

  const onChange = React.useCallback((e) => {
    if (boidRef.current === null) {
      return;
    }
    boidRef.current.fps = e.target.value;
  }, [boidRef]);

  const onStateEvent = React.useCallback((e: CustomEvent<StateEvent>) => {
    if (boidRef.current === null) {
      return;
    }
    setState(e.detail);
  }, [boidRef, setState]);

  const isPlayEnabled = state.isPlaying ? true : "";
  const isPauseEnabled = !state.isPlaying ?  true : "";

  return (
    <>
      <WanderBoid onStateEvent={onStateEvent} ref={boidRef}>
      </WanderBoid>
      <div>
        <button disabled={isPlayEnabled} onClick={play}>play</button>
        <button disabled={isPauseEnabled} onClick={pause}>pause</button>
        <input onChange={onChange} type="range" value={state.ps} min="6" max="35"></input>
      </div>
    </>
  )
}
