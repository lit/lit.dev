import {ComplexAttributeConverter, ReactiveController, ReactiveControllerHost} from 'lit';

export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  private _value = new Date();
  private _timerID?: number;
  private _userSet = false;

  timeout: number;

  get value() {
    return this._value;
  }

  set value(v: Date) {
    this._userSet = true;
    this._value = v;
    this.stop();
  }

  constructor(host: ReactiveControllerHost, timeout = 1000) {
    (this.host = host).addController(this);
    this.timeout = timeout;
  }

  hostConnected() {
    // Start a timer when the host is connected
    if (!this._userSet) {
      this.start();
    }
  }

  hostDisconnected() {
    // Stop the timer when the host is disconnected
    this.stop();
  }

  start() {
    this._userSet = false;
    this._timerID = setInterval(() => {
      this._value = new Date();
      // Update the host with new value
      this.host.requestUpdate();
    }, this.timeout);
  }

  stop() {
    if (this._timerID !== undefined) {
      clearInterval(this._timerID);
      this._timerID = undefined;
    }
    this.host.requestUpdate();
  }
}

export const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true
});

export const timeConverter: ComplexAttributeConverter = {
  fromAttribute(t: string) {
    return new Date(Date.parse(`01 Jan 1970 ${t}`));
  },
  toAttribute(t: Date) {
    return timeFormat.format(t);
  }
};
