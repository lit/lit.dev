import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('comment-card')
export class CommentCard extends LitElement {

  static styles = css`
    :host {
      border: 1px solid #666;
      border-radius: 5px;
      background: #ddd;
      display: flex;
      font-family: sans-serif;
      padding: 5px;
      max-width: 500px;
    }
    .avatar {
      height: 40px;
      width: 40px;
      background: lightblue;
      border: 1px solid #666;
      border-radius: 20px;
    }
    .subject {
      font-weight: bold;
    }
    .usertime {
      white-space: nowrap;
    }
    .body {
      flex: 1;
      margin-inline-start: 10px;
    }
  `;

  @property() subject = 'Default title';
  @property() content = 'Lorem ipsum dolor sit amet.';
  @property() user = 'username';
  @property() time = 'one minute ago';
  @property() avatar = '//joeschmoe.io/api/v1/jess';

  render() {
    return html`
      <img class="avatar" src=${this.avatar}>
      <div class="body">
        <div class="header">
          <span class="subject">${this.subject}</span>
          <span class="usertime">@${this.user} • ${this.time}</span>
        </div>
        <div class="content">${this.content}</div>
      </div>
    `;
  }

}
