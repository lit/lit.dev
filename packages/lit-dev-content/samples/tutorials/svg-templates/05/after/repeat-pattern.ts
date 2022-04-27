import type {SVGTemplateResult} from "lit";

import {LitElement, html, svg, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';


const themeCSS = css`
	.background {
		fill: var(--background-color, #fff);
	}

	text {
		fill: var(--font-color, #000);
		font-size: var(--font-size, 24px);
		stroke-width: var(--stroke-width, 1);
		stroke: var(--stroke-color, #efefef);
	}
`;

const svgCSS = css`
	svg {
		height: 100%;
		width: 100%;
	}

	text {
		fill: #fff;
		dominant-baseline: hanging;
		font-family: monospace;
		font-size: 24px;
	}

	rect {
		width: 100%;
		height: 100%;
	}
`;

const createElement = (chars: string): SVGTemplateResult => svg`
    <text id="chars">${chars}</text>
`;

const createMotif = (
	numPrints: number,
	offset: number = 0,
): SVGTemplateResult => {
	const rotation = 360 / numPrints;

	const prints = [];
	let currRotation = offset;
	for (let index = 0; index < numPrints; index++) {
		currRotation += rotation;
		prints.push(svg`
			<use
				href="#chars"
				transform="rotate(${currRotation}, 0, 0)">
			</use>
    	`)
	}

	return svg
		`<g
			id="chars-rotated"
			transform="translate(50, 50)">
				${prints}
		</g>`;
};

const createClipPath = () => svg`
	<clipPath id="rect-clip">
		<rect width="200" height="200"></rect>
	</clipPath>
`;

const createTile = () => svg`
	<g clip-path="url(#rect-clip)">
		<use transform="translate(0, 0)" href="#chars-rotated"></use>
		<use transform="translate(0, 100)" href="#chars-rotated"></use>
		<use transform="translate(100, -50)" href="#chars-rotated"></use>
		<use transform="translate(100, 50)" href="#chars-rotated"></use>
		<use transform="translate(100, 150)" href="#chars-rotated"></use>
	</g>
`;

const createRepeatPattern = () => svg`
	<pattern
		id="pattern-rounds"
		x="-10"
		y="-10"
		width="200"
		height="200"
		patternUnits="userSpaceOnUse">
		${createTile()}
	</pattern>
`;

@customElement('repeat-pattern')
export class RepeatPattern extends LitElement {
	static styles = [svgCSS, themeCSS];

	@property({type: String}) chars = "lit";
	@property({type: Number, attribute: "num-prints"}) numPrints = 5;
	@property({
		type: Number,
		attribute: "rotation-offset",
	}) rotationOffset = 0;

	render() {
		return html`
			<svg>
				<defs>
					${createClipPath()}
					${createElement(this.chars)}
					${createMotif(
						this.numPrints,
						this.rotationOffset,
					)}
					${createRepeatPattern()}
				</defs>

				<rect class="background"></rect>
				<rect fill="url(#pattern-rounds)"></rect>
			</svg>
		`;
	}
}
