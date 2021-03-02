import { LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { html, unsafeStatic } from 'lit/static-html.js';

@customElement('my-element')
export class MyElement extends LitElement {
  tag = 'p';
  attribute = 'foo';
  static = '<p>static</p>';
  @property() dynamic = 'dynamic';
  render() {
    return html`
      <${unsafeStatic(this.tag)} ${unsafeStatic(this.attribute)}>
        <p>${this.dynamic}</p>
        ${unsafeStatic(this.static)}
      </${unsafeStatic(this.tag)}>`;
  }
}
