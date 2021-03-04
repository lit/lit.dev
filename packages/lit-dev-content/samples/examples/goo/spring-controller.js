import {Spring} from 'wobble/dist/wobble.es.js';

export class SpringController2D {
  xSpring;
  ySpring;

  constructor(host, options) {
    this.host = host;

    this.xSpring = new Spring({
      ...options,
      toValue: options.pos && options.pos[0],
    });
    this.xSpring.onUpdate((s) => {
      this.host.requestUpdate();
    });

    this.ySpring = new Spring({
      ...options,
      toValue: options.pos && options.pos[1],
    });
    this.ySpring.start();
    this.ySpring.onUpdate((s) => {
      this.host.requestUpdate();
    });
  }

  get currentValue() {
    return [this.xSpring.currentValue, this.ySpring.currentValue];
  }

  get pos() {
    return [this.xSpring.toValue, this.ySpring.toValue];
  }

  set pos([x, y]) {
    this.xSpring.updateConfig({toValue: x});
    this.xSpring.start();

    this.ySpring.updateConfig({toValue: y});
    this.ySpring.start();
  }
}
