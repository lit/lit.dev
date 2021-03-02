---
title: HTML
eleventyNavigation:
  key: HTML
  parent: Templates
  order: 2
---

Lit templates describe HTML that is rendered by the browser into the DOM. You can combine static strings of HTML with dynamic [expressions](/guide/templates/expressions). The static portions of the template must describe [well-formed HTML](#well-formed-html), and expressions are only valid at specific [locations](#expression-locations) in the template. However, Lit also supports a special type of [static expression](#static-expressions) which can be used in any location in the template and is a one-time interpolation that is not intended to be updated.

## Well-formed HTML { #well-formed-html }

Lit templates must be well-formed HTML. The templates are parsed by the browser's built-in HTML parser before any values are interpolated. Follow these rules for well-formed templates:

 *  Templates must be well-formed HTML when all expressions are replaced by empty values.

 *  Templates can have multiple top-level elements and text.

 *  Templates **_should not contain_** unclosed elements—they will be closed by the HTML parser.

    ```js
    // HTML parser closes this div after "Some text"
    const template1 = html`<div class="broken-div">Some text`;
    // When joined, "more text" does not end up in .broken-div
    const template2 = html`${template1} more text. </div>`;
    ```

<div class="alert alert-info">

Because the browser's built-in parser is very lenient, most cases of malformed templates are not detectable at runtime, so you won't see  warnings—just templates that don't behave as you expect. We recommend using <a href="/guide/tools/development/#linting">linting tools</a> and <a href="/guide/tools/development/#ide-plugins">IDE plugins</a> to find issues in your templates during development.

</div>

## Valid expression locations { #expression-locations }

Expressions **_can only occur_** where you can place attribute values and child elements in HTML.

```html
<!-- attribute values -->
<div label=${label}></div>
<button ?disabled=${isDisabled}>Click me!</button>
<input .value=${currentValue}>
<button @click=${this.handleClick()}>

<!-- child content -->
<div>${textContent}</div>
```

Element expressions can occur inside the opening tag after the tag name:

```html
<div ${ref(elementReference)}></div>
```

Expressions **_cannot_** appear where tag or attribute names would appear; however [static expressions](#static-expressions) can.

```html
<!-- ERROR -->
<${tagName}></${tagName}>

<!-- ERROR -->
<div ${attrName}=true></div>
```

 ## Static expressions { #static-expressions }

Static expressions are special one-time interpolations of values into the template that are not intended to be updated. Because they become part of the static HTML of the template, they can exist anywhere in the template; however, when the static content is iterpolated into the template, the template must be [well-formed HTML](#well-formed-html).

To create static expressions, import Lit's `static-html` module. It contains special `html` and `svg` tag functions which support static expressions and should be used instead of the standard versions provided in the `lit` module. The `unsafeStatic()` function should be used to create static expressions.

<div class="alert alert-info">

Note the use of "unsafe" in `unsafeStatic()`. Creating static expressions should be considered "unsafe" from a security perspective, and therefore used with caution. To avoid potential [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) security issues, never allow user content to be used as an argument to `unsafeStatic()` .

</div>

In the following example, the values defined with `unsafeStatic()` are not reactive and do not cause the template to update.

{% playground-example "docs/templates/html/" "my-element.ts" %}

### Updating static expressions

Note, it **is** possible to update the values of static expressions by changing them and manually re-rendering the template, for example by calling `this.requestUpdate()` in your component. However, mutating the values passed to `unsafeStatic()` is generally not a good idea since instead of doing a normal, efficient Lit update, this will cause the template to completely re-render.
