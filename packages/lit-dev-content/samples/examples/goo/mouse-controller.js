export class MouseController {
  host;
  pos = [0, 0];

  _onMouseMove = ({clientX, clientY}) => {
    this.pos = [clientX, clientY];
    this.host.requestUpdate();
  };

  constructor(host) {
    this.host = host;
    window.addEventListener('mousemove', this._onMouseMove);
  }

  // TODO: We need a way to hook the host's connectedness
  // connectedCallback() {
  //   window.addEventListener('mousemove', this._onMouseMove);
  // }

  // disconnectedCallback() {
  //   window.removeEventListener('mousemove', this._onMouseMove);
  // }
}
