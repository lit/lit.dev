import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import './comment-card.js';

import {timeAgo} from './time-ago.js';

const timeCreated = new Date();

@customElement('time-ago-example')
export class TimeAgoExample extends LitElement {

  render() {
    return html`
      <p>This page was rendered ${timeAgo(timeCreated)}.</p>

      <comment-card user="litdeveloper"
                time=${timeAgo(timeCreated)}
                subject="Just tried AsyncDirectives!"
                content="Cool stuff, they're really powerful!">
      </comment-card>
    `;
  }

}
