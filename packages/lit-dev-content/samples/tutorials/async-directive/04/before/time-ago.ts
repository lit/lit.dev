import {format} from 'timeago.js';
import {directive, Directive} from 'lit/directive.js';

class TimeAgoDirective extends Directive {

  render(time: Date) {
    return format(time);
  }

}

export const timeAgo = directive(TimeAgoDirective);
