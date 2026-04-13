---
title: Release notes
eleventyNavigation:
  key: Release notes
  parent: lit-html
  order: 10
versionLinks:
  v2: releases/upgrade/
  v3: releases/upgrade/
---

## lit-html 1.3.0

### Trusted Types

<a href="https://web.dev/trusted-types/" target="_blank" rel="noopener">Trusted Types</a> helps eliminate cross-site scripting (XSS) attacks by limiting the ability to use unsafe DOM APIs, like `innerHTML`. When Trusted Types is enabled, unsafe APIs disallow use with easily user-controlled types like strings, and instead require values be one of a small set of trusted types, like `TrustedHTML`, that can only be created by a Trusted Type policy.

This prevents application code from accidentally passing unsanitized user-controlled values directly to unsafe APIs and makes it easier to review security sensitive code that uses the Trusted Type policies.

lit-html 1.3.0 is compatible with Trusted Types. lit-html was already very XSS-resistant because it treats string data (as opposed to template strings) as _text_ content, not unsafe HTML, but it does have to pass the HTML from template strings to unsafe APIs like `innerHTML`. lit-html now does this via a Trusted Type policy if the policy API exists.

Trusted Types shipped in Chrome 83, and is enabled via Content Security Policy. You can (and should!) enable Trusted Types for additional XSS protection on Chrome, and other browsers when they ship Trusted Types.

### type: module

We've added the `"type"` field in package.json, set to "module". This is the standard way to indicate that the .js files in an npm package are standard JavaScript modules. Node only supports this field and not the previous community initiated methods for this. We've kept the existing `"module"` field, since some tools do not yet support the `"type"` field.

### Export `shadyTemplateFactory`

The folks at open-wc.org have an interesting extension to lit-html that emulates scoped custom element definitions. They had to copy the shady-render module though, because `shadyTemplateFactory` wasn't exported. We now export it to save some bytes when using that library.

Please note that we will likely remove template factories in a future major version of lit-html, so we don't recommend using this API. Open-wc is investigating another approach for their use case.

## lit-html 1.2.0

### `live` directive

[Documentation](/docs/v1/lit-html/template-reference/#live)

The `live` directive solves the problem of DOM state changing from underneath lit-html, for example with an `<input>` that a user can type into:

```js
html`<input .value=${live(x)}>`
```

In some cases you will want `x` to overwrite what the user has typed in. lit-html tracks the previous value of a binding and only updates the DOM if the value has changed. Without the live directive, lit-html will not detect that the `value` property of the input has changed and won't update the DOM.

The live directive ignores the previous value of the binding and always checks the current value in the DOM, causing the binding to update the input.

We still recommend that you handle user input so that the state and the DOM agree:

```ts
let text = '';
const onInput = (e) => {
  text = e.target.value;
  go();
};

const go = () => {
  render(html`<input .value=${text} @input=${onInput}>`, document.body);
}
go();
```

### `templateContent` directive

[Documentation](/docs/v1/lit-html/template-reference/#templatecontent)

The `templateContent` directive lets you stamp out HTML templates into lit-html templates. This is useful in a number of cases where HTML `<template>` elements are provided by users of elements or parts of a build system.

HTML:
```html
<template id="example">
  <p>HTML Template</p>
</template>
```

JavaScript:
```js
const template = document.querySelector('#example');
html`
  <h1>Example</h1>
  ${templateContent(template)}
`;
```

### `unsafeSVG` directive

[Documentation](/docs/v1/lit-html/template-reference/#unsafehtml)

`unsaveSVG` is the missing partner of [`unsafeHTML`](/docs/v1/lit-html/template-reference/#unsafehtml). It lets you render a frangment of SVG text as SVG elements rather than text. As with `unsafeHTML` this directive not safe to use with user-provided input, since if the input has `<script>` tags in it, there may be ways to get them to execute, etc.

`unsafeSVG` creates elements in the SVG namespace, so it's for use inside of `<svg>` tags or inside of lit-html {% api-lit-html-1 "svg" %} templates. If the input contains an `<svg>` tag itself, continute to use `unsafeHTML`.

```js
// shape is SVG partial text, with no <svg> element
const renderShape = (shape) => html`
  <svg  width="100" height="100" viewBox="0 0 100 100">
    ${unsafeSVG(shape)}
  </svg>
`;
```

## Releases prior to 1.2.0

We don't have written release notes for releases prior to 1.2.0. Please see the <a href="https://github.com/Polymer/lit-html/blob/master/CHANGELOG.md" target="_blank" rel="noopener">changelog</a> for those releases.
