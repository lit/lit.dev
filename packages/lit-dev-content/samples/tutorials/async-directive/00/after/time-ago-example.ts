/* playground-hide */
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {timeAgo} from './time-ago.js';

import './comment-card.js';

const timeNow = new Date();

@customElement('time-ago-example')
export class TimeAgoExample extends LitElement {

  static styles = css`
    hr { margin: 20px 0; }
  `;

  @property() chosenTime = new Date('2020-03-10');

  /* playground-hide-end */
  render() {
    return html`
      <p>This page was rendered ${timeAgo(timeNow)}.</p>
      <hr>

      Select your last vacation:
      <input type="date" .valueAsDate=${this.chosenTime} @change=${this.updateTime}>
      <p>Your last vacation was ${timeAgo(this.chosenTime)}.</p>
      <hr>

      <comment-card user="litdeveloper"
                    time=${timeAgo(timeNow)}
                    subject="Just tried AsyncDirectives!"
                    content="I just tried out these AsyncDirectives in Lit and they're pretty powerful!">
      </comment-card>
    `;
  }
  /* playground-hide */

  updateTime(event: Event) {
    const target = event.target as HTMLInputElement;
    this.chosenTime = target.valueAsDate!;
  }

}
/* playground-hide-end */
