Next, let's allow the displayed time to be set from an attribute. To do that we'll define a custom attribute converter.

## Add an attribute converter

Create a top-level variable named `timeConverter`.

{% switchable-sample %}

```ts
const timeConverter: ComplexAttributeConverter = {
  fromAttribute(t: string) {
    return new Date(Date.parse(`01 Jan 1970 ${t}`));
  },
  toAttribute(t: Date) {
    return timeFormat.format(t);
  }
};
```

```js
const timeConverter = {
  fromAttribute(t) {
    return new Date(Date.parse(`01 Jan 1970 ${t}`));
  },
  toAttribute(t) {
    return timeFormat.format(t);
  }
};
```

{% endswitchable-sample %}

### Use the converter in the property definition

Remove the `attribute: fase` option and add `converter: timeConverter`:

```ts
  @property({converter: timeConverter})
  time = new Date();
```
