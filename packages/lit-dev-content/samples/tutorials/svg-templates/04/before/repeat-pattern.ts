import type {SVGTemplateResult} from "lit";

import {LitElement, html, svg, css} from 'lit';
import {customElement} from 'lit/decorators.js';


const textCSS = css`
	text {
    fill: #ffffff;
		dominant-baseline: hanging;
		font: bold 28px monospace;
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
  static styles = textCSS;

  render() {
    return html`
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${createClip()}
          ${createChars("l-char", "lit")}
          ${createPatternWithRotation("l-group", "l-char", 8, 30)}
          ${createRepeatPattern()}
        </defs>
 
        <rect x="0" y="0" width="100%" height="100%" fill="#000000"></rect>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-rounds)"></rect>
      </svg>
    `;
  }
}
