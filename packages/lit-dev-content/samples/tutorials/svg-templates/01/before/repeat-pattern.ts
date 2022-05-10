import type { SVGTemplateResult } from "lit";

import { LitElement, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {        
    render() {
        return html`<svg height="100%" width="100%"></svg>`;
    }
}