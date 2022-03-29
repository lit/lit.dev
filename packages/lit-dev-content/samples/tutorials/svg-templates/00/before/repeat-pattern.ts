import type {SVGTemplateResult} from "lit";

import {LitElement, html, svg, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';


const textCSS = css`
	text {
		dominant-baseline: hanging;
		font: bold 28px monospace;
	}
`;

const themeCSS = css`
	text {
		fill: var(--pattern-text-color, #000000);
		font-size: var(--pattern-text-font-size, 28px);
		stroke-width: var(--pattern-text-stroke-size, 1.5);
		stroke: var(--pattern-text-stroke-color, #80ffe5);
	}
	.background {
		fill: var(--pattern-background-color, #6e2bcc);
	}
`;

const createChars = (patternID: string, chars: string): SVGTemplateResult => svg`
    <text id="${patternID}">${chars}</text>
`;

const createPatternWithRotation = (groupID: string, patternID: string, numPrints: number, offset: number = 0): SVGTemplateResult => {
	const rotation = 360 / numPrints;

	const prints = [];
	let currRotation = offset;
	for (let index = 0; index < numPrints; index++) {
		currRotation += rotation;
		prints.push(svg`
			<use href="#${patternID}" transform="rotate(${currRotation}, 0, 0)"></use>
    	`);
	}

	return svg`<g id="${groupID}" transform="translate(50, 50)">${prints}</g>`;
}

const createClip = () => svg`
	<clipPath id="myClip">
		<rect width="200" height="200"></rect>
	</clipPath>
`;

const createMotif = () => svg`
	<g clip-path="url(#myClip)" id="pattern-motif">
		<use transform="translate(0, 0)" href="#l-group"></use>
		<use transform="translate(0, 100)" href="#l-group"></use>
		<use transform="translate(100, -75)" href="#l-group"></use>
		<use transform="translate(100, 25)" href="#l-group"></use>
		<use transform="translate(100, 125)" href="#l-group"></use>
	</g>
`;

const createRepeatPattern = () => svg`
	<pattern id="pattern-rounds" x="-10" y="-10" width="200" height="200" patternUnits="userSpaceOnUse">
		${createMotif()}
	</pattern>
`;

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {
	static styles = [textCSS, themeCSS];

	@property({type: String}) text = "lit"
	@property({type: Number}) numPrints = 9;
    @property({type: Number}) offset = 20;

	render() {
		return html`
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					${createClip()}
					${createChars("l-char", "lit")}
					${createPatternWithRotation("l-group", "l-char", this.numPrints, this.offset)}
					${createRepeatPattern()}
				</defs>

				<rect class="background" x="0" y="0" width="100%" height="100%"></rect>
				<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-rounds)"></rect>
			</svg>
		`;
	}
}
