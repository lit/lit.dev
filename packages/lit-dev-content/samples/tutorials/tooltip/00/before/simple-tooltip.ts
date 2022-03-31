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
  static lazy(target: Element, callback: (target: Element) => SimpleTooltip|undefined) {
    let called = false;
    enterEvents.forEach(name => target.addEventListener(name, () => {
      if (!called) {
        called = true;
        const tooltip  = callback(target);
        if (tooltip) {
          target.parentNode!.insertBefore(tooltip, target.nextSibling);
          tooltip.show();
        }
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
      pointer-events: none;

      /* Fade in */
      opacity: 0;
      transform: scale(0.75);
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
  isSetup = false;
  renderPart?: ChildPart;
  render(value: unknown = '') {}
  update(part: ElementPart, [value]: Parameters<this['render']>) {
    const result = html`<simple-tooltip>${value}</simple-tooltip>`;
    if (!this.isSetup) {
      this.isSetup = true;
      SimpleTooltip.lazy(part.element, () => {
        const fragment = document.createDocumentFragment();
        this.renderPart = render(result, fragment, part.options);
        return fragment.firstElementChild as SimpleTooltip;
      });
    } else if (this.renderPart) {
      setChildPartValue(this.renderPart, result);
    }
  }
}

export const tooltip = directive(TooltipDirective);

/* playground-fold-end */
