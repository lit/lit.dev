---
title: Internal demos
---

This is an _internal only_ page to demonstrate various ways to embed code into
Markdown docs.

It also includes samples of various text formats used in the Guides.

## Syntax highlighting

Just highlight some code, non-interactive. Uses the same renderer as playground,
so highlight styles will match.

````
```js
html`<h1>Hello ${name}</h1>`
```
````

```js
html`<h1>Hello ${name}</h1>`
```

## Single file example

One editable file from a project, with a preview right below.

Arguments:
1. Path of the project dir from `site/_includes/projects/PATH/project.json`.
2. Filename from project to show.

Additional `project.json` config options:
- `editorHeight`: Height of the editor in pixels (default `300px`).
- `previewHeight`: Height of the preview in pixels (default `120px`).

```
{% raw %}{% playground-example "docs/templates/define" "my-element.js" %}{% endraw %}
```

{% playground-example "docs/templates/define" "my-element.js" %}

## Full IDE

Fully editable playground project, with preview to the side.

Arguments:
1. (Required) Path of the project dir from `site/_includes/projects/PATH/project.json`.

```
{% raw %}{% playground-ide "docs/templates/define" %}{% endraw %}
```

{% playground-ide "docs/templates/define" %}

## Package versions

Use `importMap.imports` in your `project.json` file to control the resolution of
bare module specifiers.

```json
{
  "importMap": {
    "imports": {
      "lit-element": "https://cdn.skypack.dev/lit-element@next-major",
      "lit-element/": "https://cdn.skypack.dev/lit-element@next-major/",
      "lit-html": "https://cdn.skypack.dev/lit-html@next-major",
      "lit-html/": "https://cdn.skypack.dev/lit-html@next-major/"
    }
  }
}
```

## Headings—this is an h2

Always followed by a paragraph.

### And an h3

Always followed by a paragraph.

#### H4 is the lowest level we use.

Always followed by a paragraph. H4s don't show up in the TOC.

## Formats

We don't do a lot of fancy styles. We do use code font for when we're using code in text:

* Override the `render()` method to define a template.

### Asides

We use two different styles of asides. Also known as alerts, notes, admonitions, or "pretty boxes." In our existing styles, the two types look much the same, which is probably unhelpful.

<div class="alert alert-info">

**Informational asides are lower priority.** These notes fill in information that's peripheral to the main discussion. Possibly interesting but not essential. They start with run-in heads so the reader can quickly assess whether the aside is relevant to their interests. They should probably look less important than the surrounding text. Certainly not more important.

</div>

There are also, much more rarely, warnings.

<div class="alert alert-warning">

**Do not bathe with toasters.** The toaster won't enjoy it, and neither will you. These higher profile admonitions should be more noticeable.

</div>

### Tables

We don't use a ton of tables, but we should probably make sure the ones we do use look OK.

| Browser  | Module Specifiers     | Modern JS      | Web Components       |
|:---------|:---------------------:|:--------------:|:--------------------:|
| Chrome   | 90                    | 80             | 67                   |
| Safari   | build                 | 13             | 10                   |
| Firefox  | build                 | 72             | 63                   |
| Edge (Chromium) | build          | 80             | 79                   |
| Edge 14-18 | build               | build          | polyfill             |
| Internet Explorer 11 | build     | build          | polyfill             |

### Figures

Again, we don't use a lot of figures. We don't add figure captions. I guess it doesn't look hip.

![Inheritance diagram showing LitElement inheriting from ReactiveElement, which in turn inherits from HTMLElement. LitElement is responsible for templating; ReactiveElement is responsible for managing reactive properties and attributes; HTMLElement is the standard DOM interface shared by all native HTML elements and custom elements.](/images/guide/components/lit-element-inheritance.png)
