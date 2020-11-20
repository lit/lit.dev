---
title: Conditional templates
eleventyNavigation:
  key: Conditional templates
  parent: Templates
  order: 2
---

<!-- TODO: check all import paths. Runnable samples? -->

Lit templates have no built-in control-flow constructs. Instead you use normal JavaScript expressions and statements.

## Conditionals with ternary operators

Ternary expressions are a great way to add inline conditionals:

```js
html`
  ${this.user.isloggedIn
      ? html`Welcome ${this.user.name}`
      : html`Please log in`
  }
`;
```


## Conditionals with if statements

You can express conditional logic with if statements outside of a template to compute values to use inside of the template:

```js
getUserMessage() {
  if (this.user.isloggedIn) {
    return html`Welcome ${this.user.name}`;
  } else {
    return html`Please log in`;
  }
}

html`
  ${getUserMessage()}
`
```

## Rendering nothing
Sometimes, you may want to render nothing at all. The values `undefined`, `null` and the empty string (`''`) in a text binding all render an empty text node. In most cases, that's exactly what you want:

```js
${this.user.isAdmin
      ? html`<button>DELETE</button>`
      : ''
  }
```

In some cases, you want to clear the DOM instead of rendering an empty text node. In these cases, you can use the `nothing` value provided by lit-html.

<!-- TODO check if this is the correct import for nothing? -->
```js
import {html, nothing} from 'lit-element';
  ...
${this.user.isAdmin
      ? html`<button>DELETE</button>`
      : nothing
  }
```

In this case, when `user.isAdmin` is false, no text node is rendered.

#### nothing and the slot fallback content

One specific use case where an empty text node causes issues is when you're using a `<slot>` element inside a shadow root. 

This use case is very specific to [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

Imagine you have a custom element, `example-element`, that has a slot in
its shadow DOM:

```js
html`<slot>Sorry, no content available. I am just fallback content</slot>`;
``` 

The slot defines fallback content for when there is no content defined to be put in the slot. 

So, extending the previous example:

```js
import {LitElement, html, nothing} from 'lit-element';
  ...

UserElement extends LitElement {
  render() {
    html`
      <example-element>${this.user.isAdmin
        ? html`<button>DELETE</button>`
        : nothing
      }</example-element>
    `;
  }
}
``` 

If the user is logged in, the Delete button is rendered. If the user is not logged in, nothing is rendered inside of `example-element`. This means the slot is empty and its fallback content "Sorry, no content available. I am just fallback content" is rendered.

Replacing `nothing` in this example with the empty string causes an empty text node to be rendered inside `example-element`, suppressing the fallback content.

**Whitespace creates text nodes.** For the example to work, the text binding inside `<example-element>` must be the **entire** contents of `<example-element>`. Any whitespace outside of the binding delimiters adds static text nodes to the template, suppressing the fallback content. However, whitespace _inside_ the binding delimiters is fine.

The two following examples show an element with extra whitespace surrounding the binding delimiters. 

```js
// Whitespace around the binding means the fallback content
// doesn't render
html`
<example-element> ${nothing} </example-element>
`;
// Line breaks count as whitespace, too
html`
<example-element>
${nothing}
</example-element>
`;
```

## Caching template results: the cache directive 

In most cases, JavaScript conditionals are all you need for conditional templates. However, if you're switching between large, complicated templates, you might want to save the cost of recreating DOM on each switch. 

In this case, you can use the `cache` _directive_. Directives are special functions that provide extra control over rendering. The cache directive caches DOM for templates that aren't being rendered currently. 

<!-- TODO: Check import paths -->

```js
import {html} from 'lit-element';
import {cache} from 'lit-html/directives/cache.js';

const detailView = (data) => html`<div>...</div>`; 
const summaryView = (data) => html`<div>...</div>`;

  ...

html`${cache(this.data.showDetails
  ? detailView(this.data) 
  : summaryView(this.data)
)}`
```

When Lit re-renders a template, it only updates the modified portions: it doesn't create or remove any more DOM than it needs to. But when you switch from one template to another, Lit needs to remove the old DOM and render a new DOM tree. 

The `cache` directive caches the generated DOM for a given binding and input template. In the example above, it would cache the DOM for both the  `summaryView` and `detailView` templates. When you switch from one view to another, Lit just needs to swap in the cached version of the new view, and update it with the latest data.
