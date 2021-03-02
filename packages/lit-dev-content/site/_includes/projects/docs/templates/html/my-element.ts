import { LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { html, unsafeStatic } from 'lit/static-html.js';

@customElement('my-element')
export class MyElement extends LitElement {
  tag = 'button';
  activeAttribute = 'active';
  @property() caption = 'A button';
  render() {
    return html`
      <${unsafeStatic(this.tag)} ${unsafeStatic(this.activeAttribute)}>
        <p>${this.caption}</p>
      </${unsafeStatic(this.tag)}>`;
  }
}
