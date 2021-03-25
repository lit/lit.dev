export class MouseController {
  host;
  pos = [0, 0];

  _onMouseMove = ({clientX, clientY}) => {
    this.pos = [clientX, clientY];
    this.host.requestUpdate();
  };

  constructor(host) {
    (this.host = host).addController(host);
  }

  hostConnected() {
    window.addEventListener('mousemove', this._onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}
