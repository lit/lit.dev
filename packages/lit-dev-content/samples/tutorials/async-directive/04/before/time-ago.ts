import {directive, Directive} from 'lit/directive.js';
import {format} from 'timeago.js';

class TimeAgoDirective extends Directive {

  render(time: Date) {
    return format(time);
  }

}

export const timeAgo = directive(TimeAgoDirective);
