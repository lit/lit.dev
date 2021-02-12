---
title: Conditional templates
eleventyNavigation:
  key: Conditional templates
  parent: Templates
  order: 3
---

{% todo %}

- Check all import paths.
- Add interactive examples.

{% endtodo %}

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

### Rendering nothing

Sometimes, you may want to render nothing in one branch of a conditional operator. The values `undefined`, `null` and the empty string (`''`) in a child expression all render an empty text node.

In a few cases, you want to clear the DOM instead of rendering an empty text node. In these cases, you can use the `nothing` value provided by Lit.

This is particularly useful when working with elements that use shadow DOM and slots. See [Templating and slot fallback content](/guide/components/shadow-dom#templating-and-slot-fallback-content) for an example using `nothing`.

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




## Caching template results: the cache directive

In most cases, JavaScript conditionals are all you need for conditional templates. However, if you're switching between large, complicated templates, you might want to save the cost of recreating DOM on each switch.

In this case, you can use the `cache` _directive_. Directives are special functions that provide extra control over rendering. The cache directive caches DOM for templates that aren't being rendered currently.

<!-- TODO: Check import paths -->

```js
import {html} from 'lit';
import {cache} from 'lit/directives/cache.js';

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
