import type { SVGTemplateResult } from "lit";

import { LitElement, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';


const createChars = (chars: string): SVGTemplateResult => svg`
    <text>${chars}</text>
`;

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {
    @property({type: String}) chars = "Compose SVGs in Lit!";
    
    render() {
        return html`
            <svg>
                ${createChars(this.chars)}
            </svg>
        `;
    }
}