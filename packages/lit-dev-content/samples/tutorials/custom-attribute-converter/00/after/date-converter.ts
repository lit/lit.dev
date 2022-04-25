import {ComplexAttributeConverter} from 'lit';

export const dateConverter: ComplexAttributeConverter<Date> = {
  toAttribute: (date: Date) => {
    return date.toString();
  },
  fromAttribute: (value: string) => {
    return new Date(value);
  }
};
