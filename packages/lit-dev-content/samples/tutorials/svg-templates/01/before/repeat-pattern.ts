import type { SVGTemplateResult } from "lit";

import { LitElement, html, svg, css } from 'lit';
import { customElement } from 'lit/decorators.js';

const textCSS = css`
    text {
        dominant-baseline: hanging;
        font: regular 28px monospace;
    }
`;

const createChars = (chars: string): SVGTemplateResult => svg`
    <text>${chars}</text>
`;

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {
    static styles = textCSS;

    render() {
        return html`
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                ${createChars("Compose SVGs in Lit!")}
            </svg>
    `;
    }
}
