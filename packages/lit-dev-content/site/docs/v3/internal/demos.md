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
1. Path of the project dir from `samples/PATH/project.json`.
2. Filename from project to show.

Additional `project.json` config options:
- `previewHeight`: Height of the preview in pixels (default `120px`).

```
{% raw %}{% playground-example "v3-docs/templates/define" "my-element.ts" %}{% endraw %}
```

{% playground-example "v3-docs/templates/define" "my-element.ts" %}

## Full IDE

Fully editable playground project, with preview to the side.

Arguments:
1. (Required) Path of the project dir from `samples/PATH/project.json`.

```
{% raw %}{% playground-ide "v3-docs/templates/define" %}{% endraw %}
```

{% playground-ide "v3-docs/templates/define" %}

## Package versions

Use `extends` in your `project.config` to inherit from the site base
configuration that resolve imports to `lit-next`:

```json
{
  "extends": "/samples/v3-base.json",
}
```