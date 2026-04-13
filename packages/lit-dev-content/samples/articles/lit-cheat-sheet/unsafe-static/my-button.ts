import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTagName, getActiveAttribute, getClasses, getPluginStyles } from './trusted-rendering-library.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';

@customElement('my-button')
export class MyButton extends LitElement {
  @state() active = false;

  render() {
    // These strings MUST be trusted, otherwise this is an XSS vulnerability
    const tag = getTagName();
    const activeAttribute = getActiveAttribute();
    const classes = getClasses();

    return html`
      ${staticHtml`
        <${unsafeStatic(tag)}
            tabindex="0"
            class=${unsafeStatic(classes)}
            ?${unsafeStatic(activeAttribute)}=${this.active}>
          <p>Hello static!</p>
        </${unsafeStatic(tag)}>`
      }
      <!-- /* playground-fold */ -->
      <fieldset>
        <legend>Toggle fancy button active state</legend>
        <label>
          <input type="checkbox" @change=${this.#toggleActive} .checked=${this.active}>
          Active
        </label>
      </fieldset>
      <!-- /* playground-fold-end */ -->`;
  }

  /* playground-fold */
  #toggleActive(e: InputEvent) {
    this.active = (e.target as HTMLInputElement).checked
  }


  constructor() {
    super();
    (MyButton.styles as any).replaceSync(getPluginStyles());
  }
  /* playground-fold-end */

  static styles = new CSSStyleSheet();
}
