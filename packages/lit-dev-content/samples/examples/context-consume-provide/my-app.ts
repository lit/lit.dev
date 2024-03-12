import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import './my-section.js';
import './my-heading.js';

@customElement('my-app')
export class MyApp extends LitElement {
  render() {
    // <my-heading> adjusts what heading tag to use based on the level context
    // provided to it.

    // <my-section> serves as both context provider and consumer. It provides a
    // level value that is 1 greater than what's provided to it. This allows
    // nested <my-section> to provide a different value based on its depth.

    return html`
      <my-section>
        <my-heading>This is h1</my-heading>
        <my-section>
          <my-heading>This is h2</my-heading>
          <my-heading>This is h2</my-heading>
          <my-heading>This is h2</my-heading>
          <my-section>
            <my-heading>This is h3</my-heading>
            <my-heading>This is h3</my-heading>
            <my-heading>This is h3</my-heading>
            <my-section>
              <my-heading>This is h4</my-heading>
              <my-heading>This is h4</my-heading>
              <my-heading>This is h4</my-heading>
            </my-section>
          </my-section>
        </my-section>
      </my-section>
    `;
  }
}
