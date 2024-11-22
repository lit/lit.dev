import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';import {ComplexAttributeConverter} from 'lit';

/**
 * Bidirectionally converts an array from an attribute to a property of the
 * following format:
 *
 * array-attribute='1, "2", 3' to [1, '2', 3]
 */
export const arrayConverter: ComplexAttributeConverter<Array<unknown>> = {
  toAttribute: (array: Array<unknown>) => {
    return JSON.stringify(array).substring(1, JSON.stringify(array).length - 1);
  },
  fromAttribute: (value: string) => {
    try {
      return JSON.parse(`[${value}]`);
    } catch {
      return [];
    }
  }
};

@customElement('my-element')
export class MyElement extends LitElement {
  @property({ converter: arrayConverter, reflect: true })
  array: Array<number|string> = [];

  render() {
    return this.array.map((item) =>
      html`<div>${typeof item}: ${item}</div>`
    );
  }
}