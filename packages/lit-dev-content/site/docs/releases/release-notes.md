---
title: Release notes
eleventyNavigation:
  key: Release notes
  parent: Releases
  order: 3
---

{# reverse isn't working :( #}
{% assign releases = collections.release | reverse %}
{% for release in releases %}

## {{ release.data.title }}

{{ release.templateContent }}

{% endfor %}

<h3>Releases Prior to lit-html 1.2.0</h3>

We don't have written release notes for lit-html releases prior to lit-html 1.2.0, or for other libraries. Please see the [changelogs on GitHub](https://github.com/Polymer/lit-html) for those releases.
