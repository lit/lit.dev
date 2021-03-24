import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {templateContent} from 'lit/directives/template-content.js';

// <template> is located in index.html file
const templateEl = document.querySelector('template#myContent') as HTMLTemplateElement;

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return  html`
      <h3>templateContent directive example</h3>
      Here's some content from a template element:
      ${templateContent(templateEl)}
    `;
  }
}
