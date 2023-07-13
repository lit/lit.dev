---
title: Conditionals
eleventyNavigation:
  key: Conditionals
  parent: Templates
  order: 3
versionLinks:
  v1: components/templates/#use-properties-loops-and-conditionals-in-a-template
  v2: templates/conditionals/
---

Since Lit leverages normal Javascript expressions, you can use standard Javascript control flow constructs like [conditional operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator), function calls, and `if` or `switch` statements to render conditional content.

JavaScript conditionals also let you combine nested template expressions, and you can even store template results in variables to use elsewhere.

## Conditionals with the conditional (ternary) operator

Ternary expressions with the conditional operator, `?`, are a great way to add inline conditionals:

```ts
render() {
  return this.userName
    ? html`Welcome ${this.userName}`
    : html`Please log in <button>Login</button>`;
}
```

## Conditionals with if statements

You can express conditional logic with if statements outside of a template to compute values to use inside of the template:

```ts
render() {
  let message;
  if (this.userName) {
    message = html`Welcome ${this.userName}`;
  } else {
    message = html`Please log in <button>Login</button>`;
  }
  return html`<p class="message">${message}</p>`;
}
```

Alternately, you can factor logic into a separate function to simplify your template:

```ts
getUserMessage() {
  if (this.userName) {
    return html`Welcome ${this.userName}`;
  } else {
    return html`Please log in <button>Login</button>`;
  }
}
render() {
  return html`<p>${this.getUserMessage()}</p>`;
}
```

## Caching template results: the cache directive

In most cases, JavaScript conditionals are all you need for conditional templates. However, if you're switching between large, complicated templates, you might want to save the cost of recreating DOM on each switch.

In this case, you can use the `cache` _directive_. The cache directive caches DOM for templates that aren't being rendered currently.

```ts
render() {
  return html`${cache(this.userName ?
    html`Welcome ${this.userName}`:
    html`Please log in <button>Login</button>`)
  }`;
}
```

See the [cache directive](/docs/v3/templates/directives/#cache) for more information.

## Conditionally rendering nothing { #conditionally-rendering-nothing }

Sometimes, you may want to render nothing in one branch of a conditional operator. This is commonly needed for child expressions and also sometimes needed in attribute expressions.

For child expressions, the values `undefined`, `null`, the empty string (`''`), and Lit's [nothing](/docs/v3/api/templates/#nothing) sentinel value all render no nodes. See [Removing child content](/docs/v3/templates/expressions/#removing-child) for more information.

This example renders a value if it exists, and otherwise renders nothing:

```ts
render() {
  return html`<user-name>${this.userName ?? nothing}</user-name>`;
}
```

For attribute expressions, Lit's [nothing](/docs/v3/api/templates/#nothing) sentinel value removes the attribute. See [Removing an attribute](/docs/v3/templates/expressions/#removing-attribute) for more information.

This example conditionally renders the `aria-label` attribute:

```ts
html`<button aria-label="${this.ariaLabel || nothing}"></button>`
```
