import {ReactiveController, ReactiveControllerHost} from 'lit';

export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  value = new Date();
  timeout: number;
  private _timerID?: number;

  constructor(host: ReactiveControllerHost, timeout = 1000) {
    (this.host = host).addController(this);
    this.timeout = timeout;
  }

  hostConnected() {
    // Start a timer when the host is connected
    this._timerID = setInterval(() => {
      this.value = new Date();
      // Update the host on new values
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    // Clear the timer when the host is disconnected
    // so we don't have memory leaks or wasted work
    clearInterval(this._timerID);
    this._timerID = undefined;
  }

}
