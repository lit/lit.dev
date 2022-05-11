/* playground-fold */
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Directive, DirectiveParameters, directive} from 'lit/directive.js';
import {ElementPart, render} from 'lit';

// Positioning library
import {computePosition, autoPlacement, offset, shift} from '@floating-ui/dom';

// Events to turn on/off the tooltip
const enterEvents = ['pointerenter', 'focus'];
const leaveEvents = ['pointerleave', 'blur', 'keydown', 'click'];

@customElement('simple-tooltip')
export class SimpleTooltip extends LitElement {

  // Lazy creation
  static lazy(target: Element, callback: (target: SimpleTooltip) => void) {
    const createTooltip = () => {
      const tooltip = document.createElement('simple-tooltip') as SimpleTooltip;
      callback(tooltip);
      target.parentNode!.insertBefore(tooltip, target.nextSibling);
      tooltip.show();
      // We only need to create the tooltip once, so ignore all future events.
      enterEvents.forEach(
        (eventName) => target.removeEventListener(eventName, createTooltip));
    };
    enterEvents.forEach(
      (eventName) => target.addEventListener(eventName, createTooltip));
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

      /* Animate in */
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
    this.style.cssText = '';
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
  };

  hide = () => {
    this.showing = false;
  };

  finishHide = () => {
    if (!this.showing) {
      this.style.display = 'none';
    }
  };

  render() {
    return html`<slot></slot>`;
  }

}

class TooltipDirective extends Directive {
  didSetupLazy = false;
  tooltipContent?: unknown;
  part?: ElementPart;
  tooltip?: SimpleTooltip;
  render(tooltipContent: unknown = '') {}
  update(part: ElementPart, [tooltipContent]: DirectiveParameters<this>) {
    this.tooltipContent = tooltipContent;
    this.part = part;
    if (!this.didSetupLazy) {
      this.setupLazy();
    }
    if (this.tooltip) {
      this.renderTooltipContent();
    }
  }
  setupLazy() {
    this.didSetupLazy = true;
    SimpleTooltip.lazy(this.part!.element, (tooltip: SimpleTooltip) => {
      this.tooltip = tooltip;
      this.renderTooltipContent();
    });
  }
  renderTooltipContent() {
    render(this.tooltipContent, this.tooltip!, this.part!.options);
  }
}

export const tooltip = directive(TooltipDirective);

/* playground-fold-end */
