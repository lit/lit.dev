import {ReactiveControllerHost} from 'lit';

export class MouseController {
  private host: ReactiveControllerHost;
  pos = {x: 0, y: 0};

  _onMouseMove = ({clientX, clientY}: MouseEvent) => {
    this.pos = {x: clientX, y: clientY};
    this.host.requestUpdate();
  };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener('mousemove', this._onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}
