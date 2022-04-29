import type { SVGTemplateResult } from "lit";

import { LitElement, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const createElement = (chars: string): SVGTemplateResult => svg`
    <text
        dominant-baseline="hanging"
        font-family="monospace"
        font-size="24px">
        ${chars}
    </text>
`;

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {    
    @property({type: String}) chars = "lit";
    
    render() {
        return html`
            <svg width="100%" height="100%">
                ${createElement(this.chars)}
            </svg>
        `;
    }
}