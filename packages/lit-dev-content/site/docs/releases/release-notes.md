---
title: Release notes
eleventyNavigation:
  key: Release notes
  parent: Releases
  order: 3
---

{% for release in collections.releasenotes %}
* [{{ release.data.title }}]({{ release.url }})
{% endfor %}

{% for release in collections.releasenotes %}
## {{ release.data.title }}
{{ release.templateContent }}
{% endfor %}

## Releases Prior to lit-html 1.2.0

We don't have written release notes for lit-html releases prior to lit-html 1.2.0, or for other libraries. Please see the [changelogs on GitHub](https://github.com/lit/lit) for those releases.
