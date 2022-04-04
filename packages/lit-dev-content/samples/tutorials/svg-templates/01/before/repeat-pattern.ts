import type { SVGTemplateResult } from "lit";

import { LitElement, html, svg, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const svgCSS = css`
    text {
        dominant-baseline: hanging;
        font-family: monospace;
		font-size: 24px;
    }
`;

const createChars = (chars: string): SVGTemplateResult => svg`
    <text>${chars}</text>
`;

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {
    static styles = svgCSS;
    
    @property({type: String}) chars = "Compose SVGs in Lit!";
    
    render() {
        return html`
            <svg>
                ${createChars(this.chars)}
            </svg>
        `;
    }
}