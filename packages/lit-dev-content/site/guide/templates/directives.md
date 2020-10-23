---
title: Built-in directives 
eleventyNavigation:
  key: Built-in directives
  parent: Templates
  order: 6
---

Directives are functions that can extend Lit by customizing the way a binding renders.

Lit includes a few built-in directives.

*   [`asyncAppend` and `asyncReplace`](#asyncappend-and-asyncreplace)
*   [`cache`](#cache)
*   [`classMap`](#classmap)
*   [`ifDefined`](#ifdefined)
*   [`guard`](#guard)
*   [`live`](#live)
*   [`repeat`](#repeat)
*   [`styleMap`](#stylemap)
*   [`templateContent`](#templatecontent)
*   [`unsafeHTML`](#unsafehtml)
*   [`unsafeSVG`](#unsafesvg)
*   [`until`](#until)

## asyncAppend and asyncReplace

`asyncAppend(asyncIterable)`<br>
`asyncReplace(asyncIterable)`

Location: text bindings

JavaScript asynchronous iterators provide a generic interface for asynchronous sequential access to data. Much like an iterator, a consumer requests the next data item with a call to `next()`, but with asynchronous iterators `next()` returns a `Promise`, allowing the iterator to provide the item when it's ready.

lit-html offers two directives to consume asynchronous iterators:

 * `asyncAppend` renders the values of an [async iterable](https://github.com/tc39/proposal-async-iteration), appending each new value after the previous.

 * `asyncReplace` renders the values of an [async iterable](https://github.com/tc39/proposal-async-iteration), replacing the previous value with the new value.

Example:

```javascript
import {asyncReplace} from 'lit-html/directives/async-replace.js';

const wait = (t) => new Promise((resolve) => setTimeout(resolve, t));
/**
 * Returns an async iterable that yields increasing integers.
 */
async function* countUp() {
  let i = 0;
  while (true) {
    yield i++;
    await wait(1000);
  }
}

render(html`
  Count: <span>${asyncReplace(countUp())}</span>.
`, document.body);
```

In the near future, `ReadableStream`s will be async iterables, enabling streaming `fetch()` directly into a template:

```javascript
import {asyncAppend} from 'lit-html/directives/async-append.js';

// Endpoint that returns a billion digits of PI, streamed.
const url =
    'https://cors-anywhere.herokuapp.com/http://stuff.mit.edu/afs/sipb/contrib/pi/pi-billion.txt';

const streamingResponse = (async () => {
  const response = await fetch(url);
  return response.body.getReader();
})();
render(html`π is: ${asyncAppend(streamingResponse)}`, document.body);
```

## cache

`cache(conditionalTemplate)`

Location: text bindings

Caches the rendered DOM nodes for templates when they're not in use. The `conditionalTemplate` argument is an expression that can return one of several templates. `cache` renders the current
value of `conditionalTemplate`. When the template changes, the directive caches the _current_ DOM nodes before switching to the new value. 

Example:

```js
import {cache} from 'lit-html/directives/cache.js';

const detailView = (data) => html`<div>...</div>`; 
const summaryView = (data) => html`<div>...</div>`;

html`${cache(data.showDetails
  ? detailView(data) 
  : summaryView(data)
)}`
```

When lit-html re-renders a template, it only updates the modified portions: it doesn't create or remove any more DOM than it needs to. But when you switch from one template to another, lit-html needs to remove the old DOM and render a new DOM tree. 

The `cache` directive caches the generated DOM for a given binding and input template. In the example above, it would cache the DOM for both the `summaryView` and `detailView` templates. When you switch from one view to another, lit-html just needs to swap in the cached version of the new view, and and update it with the latest data.

## classMap

`class=${classMap(classObj)}`

Location: attribute bindings (must be the only binding in the `class` attribute)

Sets a list of classes based on an object. Each key in the object is treated as a class name, and if the value associated with the key is truthy, that class is added to the element.

```js
import {classMap} from 'lit-html/directives/class-map.js';

let classes = { highlight: true, enabled: true, hidden: false };

html`<div class=${classMap(classes)}>Classy text</div>`;
// renders as <div class="highlight enabled">Classy text</div>
```

The `classMap` must be the only binding in the `class` attribute, but it can 
be combined with static values:

```js
html`<div class="my-widget ${classMap(dynamicClasses)}">Static and dynamic</div>`;
```

## ifDefined

`ifDefined(value)`

Location: attribute bindings

For AttributeParts, sets the attribute if the value is defined and removes the attribute if the value is undefined.

For other part types, this directive is a no-op.

Example:

```javascript
import {ifDefined} from 'lit-html/directives/if-defined';

const myTemplate = () => html`
  <img src="/images/${ifDefined(image.filename)}">
`;
```

## guard

`guard(dependencies, valueFn)`

Location: any

Renders the value returned by `valueFn`. Only re-evaluates `valueFn` when one of the 
dependencies changes identity. 

Where:

-   `dependencies` is an array of values to monitor for changes. (For backwards compatibility, 
     `dependencies` can be a single, non-array value.)
-   `valueFn` is a function that returns a renderable value.

`guard` is useful with immutable data patterns, by preventing expensive work
until data updates.

Example:

```js
import {guard} from 'lit-html/directives/guard';

const template = html`
  <div>
    ${guard([immutableItems], () => immutableItems.map(item => html`${item}`))}
  </div>
`;
```

In this case, the `immutableItems` array is mapped over only when the array reference changes.

## live

`attr=${live(value)}`

Location: attribute or property bindings

Checks binding value against the _live_ DOM value, instead of the previously
bound value, when determining whether to update the value.

This is useful for cases where the DOM value may change from outside of
lit-html. For example, when binding to an `<input>` element's `value` property,
a content editable element's text, or to a custom element that changes its
own properties or attributes.

In these cases if the DOM value changes, but the value set through lit-html
bindings hasn't, lit-html won't know to update the DOM value and will leave
it alone. If this is not what you want—if you want to overwrite the DOM
value with the bound value no matter what—use the `live()` directive.

Example:

```js
html`<input .value=${live(x)}>`
```

`live()` performs a strict equality check agains the live DOM value, and if
the new value is equal to the live value, does nothing. This means that
`live()` should not be used when the binding will cause a type conversion. If
you use `live()` with an attribute binding, make sure that only strings are
passed in, or the binding will update every render.


## repeat 

`repeat(items, keyfn, template)`<br>
`repeat(items, template)`

Location: text bindings

Repeats a series of values (usually `TemplateResults`) generated from an
iterable, and updates those items efficiently when the iterable changes. When
the `keyFn` is provided, key-to-DOM association is maintained between updates by
moving DOM when required, and is generally the most efficient way to use
`repeat` since it performs minimum unnecessary work for insertions and removals.

Example:

```js
import {repeat} from 'lit-html/directives/repeat';

const myTemplate = () => html`
  <ul>
    ${repeat(items, (i) => i.id, (i, index) => html`
      <li>${index}: ${i.name}</li>`)}
  </ul>
`;
```

If no `keyFn` is provided, `repeat` will perform similar to a simple map of
items to values, and DOM will be reused against potentially different items.

See [Repeating templates with the repeat directive](writing-templates#repeating-templates-with-the-repeat-directive) for a discussion
of when to use `repeat` and when to use standard JavaScript flow control. 

## styleMap

`style=${styleMap(styles)}`

Location: attribute bindings (must be the only binding in the `style` attribute)

The `styleMap` directive sets styles on an element based on an object, where each key in the object is treated as a style property, and the value is treated as the value for that property. For example:

```js
import {styleMap} from 'lit-html/directives/style-map.js';

let styles = { backgroundColor: 'blue', color: 'white' };
html`<p style=${styleMap(styles)}>Hello style!</p>`;
```

For CSS properties that contain dashes, you can either use the camel-case equivalent, or put the property name in quotes. For example, you can write the the CSS property `font-family` as either `fontFamily` or `'font-family'`:

```js
{ fontFamily: 'roboto' }
{ 'font-family': 'roboto' }
```

The `styleMap` must be the only binding in the `style` attribute, but it can 
be combined with static values:

```js
html`<p style="color: white; ${styleMap(moreStyles)}">More styles!</p>`;
```

## templateContent

`templateContent(templateElement)`

Location: text bindings

 Renders the content of a `<template>` element as HTML.
 
Note, the template contents should be developer controlled and not
user controlled. User controlled templates rendered with this directive
could lead to cross-site scripting (XSS) vulnerabilities.

Example:

```js
import {templateContent} from 'lit-html/directives/template-content';

const templateEl = document.querySelector('template#myContent');

const template = html`
  Here's some content from a template element:

  ${templateContent(templateEl)}`;
```


## unsafeHTML

`unsafeHTML(html)`

Location: text bindings

Renders the argument as HTML, rather than text.

Note, this is unsafe to use with any user-provided input that hasn't been
sanitized or escaped, as it may lead to cross-site scripting (XSS) vulnerabilities.

Example:

```js
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';

const markup = '<div>Some HTML to render.</div>';
const template = html`
  Look out, potentially unsafe HTML ahead:
  ${unsafeHTML(markup)}
`;
```

## unsafeSVG

`unsafeSVG(svg)`

Location: text bindings

Renders the argument as SVG, rather than text.

Note, this is unsafe to use with any user-provided input that hasn't been
sanitized or escaped, as it may lead to cross-site-scripting vulnerabilities.

Example:

```js
import {unsafeSVG} from 'lit-html/directives/unsafe-svg';

const svg = '<circle cx="50" cy="50" r="40" fill="red" />'

const template = html`
  Look out, potentially unsafe SVG ahead:
  <svg width="40" height="40" viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg" version="1.1">
    ${unsafeSVG(svg)}
  </svg> `;
```

## until

`until(...values)`

Location: any

Renders placeholder content until the final content is available. 

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

```javascript
import {until} from 'lit-html/directives/until.js';

const content = fetch('./content.txt').then(r => r.text());

html`${until(content, html`<span>Loading...</span>`)}`
```
