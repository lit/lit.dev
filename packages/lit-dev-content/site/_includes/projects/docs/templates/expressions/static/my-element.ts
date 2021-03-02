/* playground-fold */
import { LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';
/* playground-fold-end */
import { html, unsafeStatic } from 'lit/static-html.js';

/* playground-fold */
@customElement('my-element')
export class MyElement extends LitElement {
  tag = 'button';
  activeAttribute = 'active';
  @property() caption = 'A button';
  render() {
/* playground-fold-end */
    return html`
      <${unsafeStatic(this.tag)} ${unsafeStatic(this.activeAttribute)}>
        <p>${this.caption}</p>
      </${unsafeStatic(this.tag)}>`;
/* playground-fold */
  }
}
