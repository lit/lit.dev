import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';

/**
 * A custom element that will conditonally display slotted content based on the
 * current code language preference. Defaults to displaying `js` and `ts`.
 *
 * @example
 * ```html
 * <article>
 *   The file that deals with the code's metadata is:
 *   index.<ts-js
 *     ><span slot="js">min.js</span
 *     ><span slot="ts">d.ts</span
 *   ></ts-js>
 *   <!-- Do not have whitespace to prevent awkward whitespace between "index."
 *   and the displayed output of ts-js !-->
 * ```
 */
@customElement('ts-js')
export class TsJsLanguageDisplay extends LitElement {
  @state() private codeLanguage: string = getCodeLanguagePreference();

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(CODE_LANGUAGE_CHANGE, this._onCodeLanguageChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(
      CODE_LANGUAGE_CHANGE,
      this._onCodeLanguageChange
    );
  }

  private _onCodeLanguageChange = () => {
    this.codeLanguage = getCodeLanguagePreference();
  };

  render() {
    // There must not be any spaces between nodes so that text does not have any
    // unnecessary whitespace.
    return html`<slot
        name="js"
        style="display: ${this.codeLanguage === 'js' ? 'contents' : 'none'}"
        >js</slot
      ><slot
        name="ts"
        style="display: ${this.codeLanguage === 'ts' ? 'contents' : 'none'}"
        >ts</slot
      >`;
  }
}
