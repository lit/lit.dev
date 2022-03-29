import type { SVGTemplateResult } from "lit";

import { LitElement, html, svg, css } from 'lit';
import { customElement } from 'lit/decorators.js';

const textCSS = css`
	text {
		dominant-baseline: hanging;
		font: bold 28px monospace;
	}
`;

const createChars = (patternID: string, chars: string): SVGTemplateResult => svg`
    <text id="${patternID}">${chars}</text>
`;

const createPatternWithRotation = (patternID: string, numPrints: number, offset: number = 0): SVGTemplateResult => {
	const rotation = 360 / numPrints;

	const prints = [];
	let currRotation = offset;
	for (let index = 0; index < numPrints; index++) {
		currRotation += rotation;
		prints.push(svg`
			<use href="#${patternID}" transform="rotate(${currRotation}, 0, 0)"></use>
    	`)
	}

	return svg`<g transform="translate(50, 50)">${prints}</g>`;
}

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {
	static styles = textCSS;

	render() {
		return html`
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					${createChars("l-char", "lit")}
				</defs>
				${createPatternWithRotation("l-char", 8, 15)}
			</svg>
    `;
	}
}
