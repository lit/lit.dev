import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() htmlText = '';
  @state() disabled = false;
  @state() label = 'label';
  @state() value = 'value';
  @query('input') inputEl!: HTMLElement;

  render() {
    return html`
      <input
        ?disabled=${this.disabled}
        aria-label=${this.label}
        .value=${this.value}>
      <div>
        Renders to:
        <pre>${this.htmlText}</pre>
      </div>
      <!-- /* playground-fold */ -->
      <div>
        <label>
          disabled:
          <input
            type="checkbox"
            @change=${(e: Event) => (this.disabled = (e.target as HTMLInputElement).checked)}
            .checked=${this.disabled}>
        </label>
        <label>
          aria-label:
          <input
            @input=${(e: Event) => (this.label = (e.target as HTMLInputElement).value)}
            .value=${this.label}>
        </label>
        <label>
          value:
          <input
            @input=${(e: Event) => (this.value = (e.target as HTMLInputElement).value)}
            .value=${this.value}>
        </label>
      </div>
      <!-- /* playground-fold-end */ -->
    `;
  }

  updated(changed: PropertyValues<this>) {
    /* playground-fold */
    super.updated(changed);
    this.htmlText = this.inputEl.outerHTML;
    /* playground-fold-end */
  }

  static styles = css`
  /* playground-fold */
    label {
      display: block;
    }
  /* playground-fold-end */
  `;
}