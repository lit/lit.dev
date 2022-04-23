import {ComplexAttributeConverter, ReactiveController, ReactiveControllerHost} from 'lit';

export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  value = new Date();
  private _timerID?: number;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    // Start a timer when the host is connected
    this._timerID = setInterval(() => {
      this.value = new Date();
      // Update the host with new value
      this.host.requestUpdate();
    }, 1000);
  }

  hostDisconnected() {
    // Stop the timer when the host is disconnected
    if (this._timerID !== undefined) {
      clearInterval(this._timerID);
      this._timerID = undefined;
    }
  }
}
