---
title: Built-in directives
eleventyNavigation:
  key: Built-in directives
  parent: Templates
  order: 6
---

{% todo %}

  - Update list for Lit 2
  - Edit for consistency.
  - Update to use Lit samples.
  - Add interactive examples?

{% endtodo %}

Directives are functions that can extend Lit by customizing the way an expression renders.

Lit includes a few built-in directives.

*   [`asyncAppend`](#asyncappend) - appends values from an `AsyncInterable` into the DOM as they are yielded
*   [`asyncReplace`](#asyncreplace) - renders the latest value from an `AsyncInterable` into the DOM as it is yielded
*   [`cache`](#cache) - caches rendered DOM when changing templates rather than discarding the DOM
*   [`classMap`](#classmap) - sets a list of classes to an element based on an object
*   [`ifDefined`](#ifdefined) - sets an attribute if the value is defined and removes the attribute if undefined
*   [`guard`](#guard) - only re-evaluates the template when one of its dependencies changes
*   [`live`](#live) - sets an attribute or property if it differs from the live DOM value rather than the last-rendered value
*   [`repeat`](#repeat) - renders values from an interable into the DOM, with optional keying
*   [`styleMap`](#stylemap) - sets a list of style properties to an element based on an object
*   [`templateContent`](#templatecontent) - renders the content of a `<template>` element
*   [`unsafeHTML`](#unsafehtml) - renders a string as HTML rather than text
*   [`unsafeSVG`](#unsafesvg) - renders a string as SVG rather than text
*   [`until`](#until) - renders placeholder content until one or more promises resolve

## asyncAppend

Appends values from an `AsyncInterable` into the DOM as they are yielded.

| | |
|-|-|
| Import | `import {asyncAppend} from 'lit/directives/async-append.js';`|
| Signature | `asyncAppend(iterable: AsyncInterable)`|
| Usable location  | child expression |

JavaScript asynchronous iterators provide a generic interface for asynchronous sequential access to data. Much like an iterator, a consumer requests the next data item with a call to `next()`, but with asynchronous iterators `next()` returns a `Promise`, allowing the iterator to provide the item when it's ready.

`asyncAppend` renders the values of an [async iterable](https://github.com/tc39/proposal-async-iteration), appending each new value after the previous.

Example:

<div class="alert alert-info">

In the near [future](https://github.com/whatwg/streams/issues/778#issuecomment-461341033), `ReadableStream`s will be async iterables, enabling streaming `fetch()` directly into a template.

</div>

```ts
import {LitElement, html, customElement, state} from 'lit';
import {asyncAppend} from 'lit/directives/async-append.js';

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private streamingResponse = (async() => {
    // Endpoint that returns a billion digits of PI, streamed.
    const response = await fetch('http://.../pi-billion.txt');
    return response.body.getReader();
  }();

  render() {
    reutrn html`The value of π is: ${asyncAppend(this.streamingResponse)}`;
  }
}
```

## asyncReplace

Renders the latest value from an `AsyncInterable` into the DOM as it is yielded.

| | |
|-|-|
| Import | `import {asyncAppend} from 'lit/directives/async-append.js';`|
| Signature | `asyncAppend(iterable: AsyncInterable)`|
| Usable location | Child expression |

Similar to [`asyncAppend`](#asyncappend), `asyncReplace` renders the values of an [async iterable](https://github.com/tc39/proposal-async-iteration), replacing the previous value with each new value.

Example:

```ts
import {LitElement, html, customElement, state} from 'lit';
import {asyncReplace} from 'lit/directives/async-replace.js';

async function *countUp() {
  let i = 0;
  while (true) {
    yield i++;
    await new Promise((r) => setTimeout(r, 1000));
  }
};

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private count = countUp();

  render() {
    reutrn html`  Count: <span>${asyncReplace(this.count)}</span>.`;
  }
}
```

## cache

Caches rendered DOM when changing templates rather than discarding the DOM.

| | |
|-|-|
| Import | `import {cache} from 'lit/directives/cache.js';`|
| Signature | `cache(value: TemplateResult|unknown)`|
| Usable location | Child expression |

When the value passed to `cache` changes between one or more `TemplateResult`s,
the rendered DOM nodes for a given template are cached when they're not in use.
When the template changes, the directive caches the _current_ DOM nodes before
switching to the new value, and restores them from the cache when switching back
to a previously-rendered value, rather than creating the DOM nodes anew.

Example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {asyncReplace} from 'lit/directives/async-replace.js';

const detailView = (data) => html`<div>...</div>`;
const summaryView = (data) => html`<div>...</div>`;

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  data: AppData;

  render() {
    reutrn html`${cache(this.data.showDetails
      ? detailView(this.data)
      : summaryView(this.data)
    )}`;
  }
}
```

When Lit re-renders a template, it only updates the modified portions: it doesn't create or remove any more DOM than it needs to. But when you switch from one template to another, Lit needs to remove the old DOM and render a new DOM tree.

The `cache` directive caches the generated DOM for a given expression and input template. In the example above, it would cache the DOM for both the `summaryView` and `detailView` templates. When you switch from one view to another, Lit just needs to swap in the cached version of the new view, and and update it with the latest data.

## classMap

Sets a list of classes to an element based on an object.

| | |
|-|-|
| Import | `import {classMap} from 'lit/directives/class-map.js';`|
| Signature | `classMap(classInfo: {[name: string]: string | boolean | number})`|
| Usable location | `class` attribute expression (must be the only expression in the `class` attribute) |

Sets a list of classes based on an object. Each key in the object is treated as a class name, and if the value associated with the key is truthy, that class is added to the element.

Example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {classMap} from 'lit/directives/class-map.js';

@customElement('my-element')
class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = false;

  render() {
    const classes = { enabled: this.enabled, hidden: false };
    reutrn html`<div class=${classMap(classes)}>Classy text</div>`;
  }
}
```

The `classMap` must be the only expression in the `class` attribute, but it can
be combined with static values:

```ts
html`<div class="my-widget ${classMap(dynamicClasses)}">Static and dynamic</div>`;
```

## ifDefined

Sets an attribute if the value is defined and removes the attribute if undefined.

| | |
|-|-|
| Import | `import {ifDefined} from 'lit/directives/if-defined.js';`|
| Signature | `ifDefined(value: unknown)`|
| Usable location | Attribute expression |

For AttributeParts, sets the attribute if the value is defined and removes the attribute if the value is undefined (`undefined` or `null`). For other part types, this directive is a no-op.

When more than one expression exists in a single attribute value, the attribute will be removed if _any_ expression uses `ifDefined` and evaluates to `undefined`/`null`. This is especially useful for setting URL attributes, when the attribute should not be set if required parts of the URL are not defined, to prevent 404's.

Example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  filename: string | undefined = undefined;

  @property()
  size: string | undefined = undefined;

  render() {
    // src attribute not rendered if either size or filename are undefined
    reutrn html`<img src="/images/${ifDefined(this.size)}/${ifDefined(this.filename)}">`;
  }
}
```

Note that as of Lit 2.0, rendering `nothing` to any expression in an attribute value will remove the entire attribute, similar to `ifDefined`. Thus `value ?? nothing` has identical semantics to `ifDefined(value)` in an attribute expression, making the following code equivalent to the example above:

```ts
render() {
  reutrn html`<img src="/images/${this.size ?? nothing}/${this.filename ?? nothing}">`;
}
```

Nevertheless, `ifDefined` remains for backward-compatibility.

## guard

Only re-evaluates the template when one of its dependencies changes.

| | |
|-|-|
| Import | `import {guard} from 'lit/directives/guard.js';`|
| Signature | `guard(dependencies: unknown[], valueFn: () => unknown)`|
| Usable location | Any expression |

Renders the value returned by `valueFn`. Only re-evaluates `valueFn` when one of the
dependencies changes identity.

Where:

-   `dependencies` is an array of values to monitor for changes.
-   `valueFn` is a function that returns a renderable value.

`guard` is useful with immutable data patterns, by preventing expensive work
until data updates.

Example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {guard} from 'lit/directives/guard.js';

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  value: string = '';

  render() {
    return html`
      <div>
        ${guard([this.value], () => calculateSHA(this.value))}
      </div>`;
  }
}
```

In this case, the expesive `calculateSHA` function is only run when the `value` property changes.

## live

Sets an attribute or property if it differs from the live DOM value rather than the last-rendered value.

| | |
|-|-|
| Import | `import {live} from 'lit/directives/live.js';` |
| Signature | `live(value: unknown)` |
| Usable location | Attribute or property expression |

Checks expression value against the _live_ DOM value, instead of the last value rendered by Lit to this expression, when determining whether to update the value.

This is useful for cases where the DOM value may change from outside of Lit. For example, when using an expression to set an `<input>` element's `value` property,
a content editable element's text, or to a custom element that changes its
own properties or attributes.

In these cases if the DOM value changes, but the value set through Lit expression hasn't, Lit won't know to update the DOM value and will leave
it alone. If this is not what you want—if you want to overwrite the DOM
value with the bound value no matter what—use the `live()` directive.

Example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {live} from 'lit/directives/live.js';

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  value: string = '';

  render() {
    return html`<input .value=${live(this.value)}>`;
  }
}
```

`live()` performs a strict equality check agains the live DOM value, and if
the new value is equal to the live value, does nothing. This means that
`live()` should not be used when the expression will cause a type conversion. If
you use `live()` with an attribute expression, make sure that only strings are
passed in, or the expression will update every render.

## repeat

Renders values from an interable into the DOM, with optional keying.

| | |
|-|-|
| Import | `import {repeat} from 'lit/directives/repeat.js';` |
| Signature | `repeat(items: Iterable<T>, keyfn: KeyFn<T>, template: ItemTemplate<T>)`<br>`repeat(items: Iterable<T>, template: ItemTemplate<T>)`<br>`type KeyFn<T> = (item: T, index: number) => unknown;`<br>`type ItemTemplate<T> = (item: T, index: number) => unknown;`|
| Usable location | Child expression |

Repeats a series of values (usually `TemplateResults`) generated from an
iterable, and updates those items efficiently when the iterable changes. When
the `keyFn` is provided, key-to-DOM association is maintained between updates by
moving DOM when required, and is generally the most efficient way to use
`repeat` since it performs minimum unnecessary work for insertions and removals.

Example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {repeat} from 'lit/directives/repeat.js';

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  items: Array<{id: number, name: string}> = [];

  render() {
    return html`
      <ul>
        ${repeat(this.items, (item) => item.id, (item, index) => html`
          <li>${index}: ${item.name}</li>`)}
      </ul>
    `;
  }
}
```

If no `keyFn` is provided, `repeat` will perform similar to a simple map of
items to values, and DOM will be reused against potentially different items.

See [Repeating templates with the repeat directive](writing-templates#repeating-templates-with-the-repeat-directive) for a discussion
of when to use `repeat` and when to use standard JavaScript flow control.

## styleMap

Sets a list of style properties to an element based on an object.

| | |
|-|-|
| Import | `import {styleMap} from 'lit/directives/style-map.js';` |
| Signature | `styleMap(styleInfo: {[name: string]: string})` |
| Usable location | `style` attribute expression (must be the only expression in the `style` attribute) |

The `styleMap` directive sets styles on an element based on an object, where each key in the object is treated as a style property, and the value is treated as the value for that property. For example:

```ts
import {LitElement, html, customElement, property} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';

@customElement('my-element')
class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = false;

  render() {
    const styles = { backgroundColor: this.enabled ? 'blue' : 'gray', color: 'white' };
    reutrn html`<p style=${styleMap(styles)}>Hello style!</p>`;
  }
}
```

For CSS properties that contain dashes, you can either use the camel-case equivalent, or put the property name in quotes. For example, you can write the the CSS property `font-family` as either `fontFamily` or `'font-family'`:

```js
{ fontFamily: 'roboto' }
{ 'font-family': 'roboto' }
```

The `styleMap` must be the only expression in the `style` attribute, but it can
be combined with static values:

```js
html`<p style="color: white; ${styleMap(moreStyles)}">More styles!</p>`;
```

## templateContent

Renders the content of a <template> element.

| | |
|-|-|
| Import | `import {templateContent} from 'lit/directives/template-content.js';` |
| Signature | `templateContent(templateElement: HTMLTemplateElement)` |
| Usable location | Child expression |

Note, the template contents should be developer controlled and not
user controlled. User controlled templates rendered with this directive
could lead to cross-site scripting (XSS) vulnerabilities.

Example:

```ts
import {LitElement, html, customElement} from 'lit';
import {templateContent} from 'lit/directives/template-content.js';

const templateEl = document.querySelector('template#myContent');

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return  html`
      Here's some content from a template element:
      ${templateContent(templateEl)}`;
  }
}
```

## unsafeHTML

Renders a string as HTML rather than text.

| | |
|-|-|
| Import | `import {unsafeHTML} from 'lit/directives/unsafe-html.js';` |
| Signature | `unsafeHTML(value: string | typeof nothing | typeof noChange)` |
| Usable location | Child expression |

Note, this is unsafe to use with any user-provided input that hasn't been
sanitized or escaped, as it may lead to cross-site scripting (XSS) vulnerabilities.

Example:

```ts
import {LitElement, html, customElement} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

const markup = '<div>Some HTML to render.</div>';

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe HTML ahead:
      ${unsafeHTML(markup)}
    `;
  }
}
```

## unsafeSVG

Renders a string as SVG rather than text.

| | |
|-|-|
| Import | `import {unsafeSVG} from 'lit/directives/unsafe-svg.js';` |
| Signature | `unsafeSVG(value: string | typeof nothing | typeof noChange)` |
| Usable location | Child expression |

Note, this is unsafe to use with any user-provided input that hasn't been
sanitized or escaped, as it may lead to cross-site-scripting vulnerabilities.

Example:

```ts
import {LitElement, html, customElement} from 'lit';
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';

const svg = '<circle cx="50" cy="50" r="40" fill="red" />';

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe SVG ahead:
      <svg width="40" height="40" viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg" version="1.1">
        ${unsafeSVG(svg)}
      </svg> `;
  }
}
```

## until

Renders placeholder content until one or more promises resolve.

| | |
|-|-|
| Import | `import {until} from 'lit/directives/until.js';` |
| Signature | `until(...values: unknown[])` |
| Usable location | Any expression |

Takes a series of values, including Promises. Values are rendered in priority order,
 with the first argument having the highest priority and the last argument having the
 lowest priority. If a value is a Promise, a lower-priority value will be rendered until it resolves.

The priority of values can be used to create placeholder content for async
data. For example, a Promise with pending content can be the first
(highest-priority) argument, and a non-promise loading indicator template can
be used as the second (lower-priority) argument. The loading indicator
renders immediately, and the primary content will render when the Promise
resolves.

Example:

```ts
import {LitElement, html, customElement, state} from 'lit';
import {until} from 'lit/directives/until.js';

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private content = fetch('./content.txt').then(r => r.text());

  render() {
    return html`${until(this.content, html`<span>Loading...</span>`)}`;
  }
}
```
