---
title: Lists & repeating templates
eleventyNavigation:
  key: Lists & repeating templates
  parent: Templates
  order: 3
---

<!-- TODO: check all import paths. Runnable samples? -->

You can use standard JavaScript constructs to create repeating templates. 

Lit also provides some special functions, called _directives_, for use in templates. You can use the  `repeat` directive to build certain kinds of dynamic lists more efficiently.

##  Repeating templates with Array.map

To render lists, you can use `map` to transform a list of data into a list of templates:

```js
html`
<ul>
  ${this.items.map((item) => 
    html`<li>${item}</li>`
  )}
</ul>
`;
```

Note that this expression returns an array of `TemplateResult` objects. Lit will render an array or iterable of subtemplates and other values.

## Repeating templates with looping statements

You can also build an array of templates and pass it into a template binding.

```js
const itemTemplates = [];
for (const i of items) {
  itemTemplates.push(html`<li>${i}</li>`);
}

html`
  <ul>
    ${itemTemplates}
  </ul>
`;
```

## Repeating templates with the repeat directive

In most cases, using loops or `map` is an efficient way to build repeating templates. However, if you want to reorder a large list, or mutate it by adding and removing individual entries, this approach can involve recreating a large number of DOM nodes. 

The `repeat` directive can help here. Directives are special functions that provide extra control over rendering. Lit comes with some built-in directives like `repeat`. 

The repeat directive performs efficient updates of lists based on user-supplied keys:

`repeat(items, keyFunction, itemTemplate)`

Where:

*   `items` is an array or iterable.
*   `keyFunction` is a function that takes a single item as an argument and returns a guaranteed unique key for that item.
*   `itemTemplate` is a template function that takes the item and its current index as arguments, and returns a `TemplateResult`.

For example:

```js
import {html} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat.js';

const employeeList = (employees) => html`
  <ul>
    ${repeat(employees, (employee) => employee.id, (employee, index) => html`
      <li>${index}: ${employee.familyName}, ${employee.givenName}</li>
    `)}
  </ul>
`;
```

If you re-sort the `employees` array, the `repeat` directive reorders the existing DOM nodes. 

To compare this to Lit's default handling for lists, consider reversing a large list of names:

*   For a list created using `map`, Lit maintains the DOM nodes for the list items, but reassigns the values. 
*   For a list created using `repeat`, the `repeat` directive reorders the _existing_ DOM nodes, so the nodes representing the first list item move to the last position.

Which repeat is more efficient depends on your use case: if updating the DOM nodes is more expensive than moving them, use the repeat directive. Otherwise, use `map` or looping statements.

## When to use Array.map or repeat

<!-- TODO -->
