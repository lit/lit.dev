---
title: Conditional templates
eleventyNavigation:
  key: Conditional templates
  parent: Templates
  order: 3
---

{% todo %}

- Add interactive examples.

{% endtodo %}

Since Lit leverages normal Javascript expressions, you can use standard Javascript control flow constructs like [conditional operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator), function calls, and `if` or `switch` statements to render conditional content.

JavaScript conditionals also let you combine nested template expressions, and you can even store template results in variables to use elsewhere.

## Conditionals with the conditional (ternary) operator

Ternary expressions with the conditional operator, `?`, are a great way to add inline conditionals:

{% playground-example "docs/templates/conditionals/ternary" "my-element.ts" %}

## Conditionals with if statements

You can express conditional logic with if statements outside of a template to compute values to use inside of the template:

{% playground-example "docs/templates/conditionals/if" "my-element.ts" %}

Alternately, you can factor logic into a separate function to simplify your template:

{% playground-example "docs/templates/conditionals/if-function" "my-element.ts" %}

## Caching template results: the cache directive

In most cases, JavaScript conditionals are all you need for conditional templates. However, if you're switching between large, complicated templates, you might want to save the cost of recreating DOM on each switch.

In this case, you can use the `cache` _directive_. The cache directive caches DOM for templates that aren't being rendered currently.

See the [cache directive](guide/templates/directives/#cache) for more information.

{% playground-example "docs/templates/conditionals/cache" "my-element.ts" %}

When Lit re-renders a template, it only updates the modified portions: it doesn't create or remove any more DOM than it needs to. But when you switch from one template to another, Lit needs to remove the old DOM and render a new DOM tree.

The `cache` directive caches the generated DOM for a given expression and input template. In the example above, it would cache the DOM for both the  `summaryView` and `detailView` templates. When you switch from one view to another, Lit just needs to swap in the cached version of the new view, and update it with the latest data.

## Rendering nothing

Sometimes, you may want to render nothing in one branch of a conditional operator. The values `undefined`, `null` and the empty string (`''`) in a child expression all render an empty text node.

In some cases, you may want to render a value to an attribute only if data is defined and render nothing if the data is unavailable.

See [Setting values only if data is defined](/guide/templates/expressions#ifDefined) to handle this.
