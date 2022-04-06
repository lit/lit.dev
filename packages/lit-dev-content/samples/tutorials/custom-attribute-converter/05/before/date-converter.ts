import {ComplexAttributeConverter} from 'lit';

export const dateConverter: ComplexAttributeConverter<Date> = {
  toAttribute: (date: Date) => {
    // or set your favorite locale!
    return date.toLocaleDateString('en-US');
  },
  fromAttribute: (value: string) => {
    return new Date(value);
  }
};
