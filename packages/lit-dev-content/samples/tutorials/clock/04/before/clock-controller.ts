import {ReactiveController, ReactiveControllerHost} from 'lit';

export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
  }

  hostDisconnected() {
  }
}
