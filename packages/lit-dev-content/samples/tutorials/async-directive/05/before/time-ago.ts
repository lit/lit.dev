import {directive} from 'lit/directive.js';
import {AsyncDirective} from 'lit/async-directive.js';
import {format} from 'timeago.js';

class TimeAgoDirective extends AsyncDirective {

  render(time: Date) {
    return format(time);
  }

}

export const timeAgo = directive(TimeAgoDirective);
