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

One editable file from a project, with a preview right below. Gets CSS classes
`"playground-example playground-example-NAME"`

Arguments:
1. Name of the project from `site/_includes/projects/NAME/project.json`.
2. Filename from project to show.

```
{% raw %}{% playground-example "define" "my-element.js" %}{% endraw %}
```

{% playground-example "define" "my-element.js" %}

## Full IDE

Fully editable playground project, with preview to the side.

Arguments:
1. Name of the project from `site/_includes/projects/<name>/project.json`.
2. Filename from project that is editable

```
{% raw %}{% playground-ide "define" %}{% endraw %}
```

{% playground-ide "define" %}
