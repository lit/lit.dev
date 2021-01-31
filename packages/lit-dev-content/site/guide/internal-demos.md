---
title: Internal demos
---

This is an _internal only_ page to demonstrate various ways to embed code into
Markdown docs.

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
