import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

import { styles } from './styles.css.js';
import { SpringController2D } from './spring-controller.js';
import { MouseController } from './mouse-controller.js';

const slow = {
  stiffness: 400,
  damping: 500,
  mass: 10
};

const fast = {
  stiffness: 1200,
  damping: 400
};

const positionStyle = ([x, y]) =>
  styleMap({
    transform: `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
  });

/**
 * An example of how to acheive hooks-like "chaining" of reactive values through
 * several stateful transforms using a "controller" pattern.
 *
 * Ported from the React Goo demo here:
 * https://codesandbox.io/s/ppxnl191zx?from-embed=&file=/src/index.js
 *
 * Controllers are stateful and have a reference to the host allowing them to
 * trigger a re-render. LitElement doesn't have many APIs for externally hooking
 * its lifecycle, but those could be added in the future or by a mixin.
 *
 * Since controllers are stateful, they will typically be stored as instance fields
 * on the host. This is similar to useState, but in very vanilla class-based JS,
 * and without the weight or cost of a hooks system. Note that no garbage closures
 * or objects (aside from the data itself) are created during renders. The shape
 * of all the state is statically knowable, so VMs can allocate the appropriate
 * slots for fields on instance creation.
 */
class GooElement extends LitElement {
  static styles = styles;

  _mouse = new MouseController(this);
  _spring1 = new SpringController2D(this, fast);
  _spring2 = new SpringController2D(this, slow);
  _spring3 = new SpringController2D(this, slow);

  render() {
    // This is the chain of updates starting with the current mouse position and
    // flowing through each spring
    this._spring1.pos = this._mouse.pos;
    this._spring2.pos = this._spring1.currentValue;
    this._spring3.pos = this._spring2.currentValue;

    return html`
      <svg style="position: absolute; width: 0; height: 0">
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7"
          />
        </filter>
      </svg>
      <div class="hooks-main">
        <div class="hooks-filter">
          <div
            class="b1"
            style=${positionStyle(this._spring3.currentValue)}
          ></div>
          <div
            class="b2"
            style=${positionStyle(this._spring2.currentValue)}
          ></div>
          <div
            class="b3"
            style=${positionStyle(this._spring1.currentValue)}
          ></div>
        </div>
      </div>
    `;
  }
}
customElements.define("goo-element", GooElement);
