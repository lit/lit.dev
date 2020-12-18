---
title: Conditional templates
eleventyNavigation:
  key: Conditional templates
  parent: Templates
  order: 3
---

<!-- TODO: check all import paths. Runnable samples? -->

Since Lit leverages normal Javascript expressions, you don't need to use custom control-flow constructs. Instead you use standard JavaScript, like like [conditional operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator), function calls, and `if` or `switch` statements.

JavaScript conditionals let you combine nested template expressions. You can even store template results in variables to use elsewhere.

## Conditionals with the conditional (ternary) operator

Ternary expressions with the conditional operator, `?`, are a great way to add inline conditionals:

```js
render() {
  return html`
    ${this.user.isloggedIn
        ? html`Welcome ${this.user.name}`
        : html`Please log in`
    }
  `;
}
```

## Conditionals with if statements

You can express conditional logic with if statements outside of a template to compute values to use inside of the template:

```js
render() {
  let message;
  if (this.user.isloggedIn) {
    message = html`<p>Welcome ${this.user.name}</p>`;
  } else {
    message = html`<p>Please log in</p>`;
  }
  return html`<div class="message">${message}</div>`;
}
```

Alternately, you can factor logic into a separate function to simplify your template:

```js
getUserMessage() {
  if (this.user.isloggedIn) {
    return html`<p>Welcome ${this.user.name}</p>`;
  } else {
    return html`<p>Please log in</p>`;
  }
}

render() {
  return html`<div class="message">${getUserMessage()}</div>`;
}
```

## Rendering nothing

Sometimes, you may want to render nothing at all. The values `undefined`, `null` and the empty string (`''`) in a child expression all render an empty text node.

In some cases, you want to clear the DOM instead of rendering an empty text node. In these cases, you can use the `nothing` value provided by lit-html.

### nothing and the slot fallback content

One specific use case where an empty text node causes issues is when you're using a `<slot>` element inside a shadow root. This use case is very specific to [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

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

For the example to work, the expression inside `<example-element>` must take up the entire space between the opening and closing tags for `<example-element>`. Any whitespace (including line breaks) _outside_ of the expression delimiters (`${}`) adds static text nodes to the template, suppressing the fallback content. However, whitespace _inside_ the expression delimiters is fine.

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

The `cache` directive caches the generated DOM for a given expression and input template. In the example above, it would cache the DOM for both the  `summaryView` and `detailView` templates. When you switch from one view to another, Lit just needs to swap in the cached version of the new view, and update it with the latest data.
