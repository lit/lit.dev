/* playground-fold */
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Directive, directive} from 'lit/directive.js';
import {ElementPart, ChildPart, render} from 'lit';
import {setChildPartValue} from 'lit/directive-helpers.js';

// Positioning library
import {computePosition, autoPlacement, offset, shift} from '@floating-ui/dom';

// Events to turn on/off the tooltip
const enterEvents = ['mouseenter', 'focus'];
const leaveEvents = ['mouseleave', 'blur', 'keydown', 'click'];

@customElement('simple-tooltip')
export class SimpleTooltip extends LitElement {

  // Lazy creation
  static lazy(target: Element, callback: (target: Element) => void) {
    let called = false;
    enterEvents.forEach(name => target.addEventListener(name, () => {
      if (!called) {
        called = true;
        callback(target);
      }
    }, {once: true}));
  }

  static styles = css`
    :host {
      /* Position fixed to help ensure the tooltip is "on top" */
      position: fixed;
      border: 1px solid darkgray;
      background: #ccc;
      padding: 4px;
      border-radius: 4px;
      display: inline-block;

      /* Fade in */
      opacity: 0;
      transform: scale(0.5);
      transition: opacity, transform;
      transition-duration:  0.33s;
    }

    :host([showing]) {
      opacity: 1;
      transform: scale(1);
    }
  `;

  // Attribute for styling "showing"
  @property({reflect: true, type: Boolean})
  showing = false;

  // Position offset
  @property({type: Number})
  offset = 4;

  constructor() {
    super();
    // Finish hiding at end of animation
    this.addEventListener('transitionend', this.finishHide);
  }

  connectedCallback() {
    super.connectedCallback();
    // Setup target if needed
    this.target ??= this.previousElementSibling;
    // Ensure hidden at start
    this.finishHide();
  }

  // Target for which to show tooltip
  _target: Element|null = null;
  get target() {
    return this._target;
  }
  set target(target: Element|null) {
    // Remove events from existing target
    if (this.target) {
      enterEvents.forEach(name => this.target!.removeEventListener(name, this.show));
      leaveEvents.forEach(name => this.target!.removeEventListener(name, this.hide));
    }
    if (target) {
      // Add events to new target
      enterEvents.forEach(name => target!.addEventListener(name, this.show));
      leaveEvents.forEach(name => target!.addEventListener(name, this.hide));
    }
    this._target = target;
  }

  show = () => {
    this.style.display = '';
    // Simple positioning
    // const {x, y, height, width} = this.target!.getBoundingClientRect();
    // this.style.left = `${x}px`;
    // this.style.top = `${y + height + this.offset}px`;
    //
    // Robust positioning
    computePosition(this.target, this, {
      strategy: 'fixed',
      middleware: [
        offset(this.offset),
        shift(),
        autoPlacement({allowedPlacements: ['top', 'bottom']})
      ],
    }).then(({x, y}: {x: number, y: number}) => {
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
    });
    this.showing = true;
  }

  hide = () => {
    this.showing = false;
    // Hide without animation
    // this.style.display = 'none';
  }

  finishHide = () => {
    if (!this.showing) {
      this.style.display = 'none';
    }
  }

  render() {
    return html`<slot></slot>`;
  }

}

// Directive!
class TooltipDirective extends Directive {
  el?: Element;
  isSetup = false;
  renderPart?: ChildPart;
  result: unknown;
  render(value: unknown = '') {}
  update(part: ElementPart, [value]: Parameters<this['render']>) {
    this.result = html`<simple-tooltip>${value}</simple-tooltip>`;
    if (!this.isSetup) {
      this.isSetup = true;
      const el = part.element;
      SimpleTooltip.lazy(el, () => {
        const fragment = document.createDocumentFragment();
        this.renderPart = render(this.result, fragment, part.options);
        const tip = fragment.firstElementChild as SimpleTooltip;
        tip.target = el;
        el.parentNode!.insertBefore(tip, el.nextSibling);
        tip.show();
      });
    } else if (this.renderPart) {
      setChildPartValue(this.renderPart, this.result);
    }
  }
}

export const tooltip = directive(TooltipDirective);
/* playground-fold-end */
