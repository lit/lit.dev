---
title: Release notes
eleventyNavigation:
  key: Release notes
  parent: Releases
  order: 3
---

{% todo %}

- Replace release notes with correct version for Lit 2.

{% endtodo %}

<ul>
{%- for release in collections.release -%}
  <li><a href="{{ release.url }}">{{ release.data.title }}</a></li>
{%- endfor -%}
</ul>

{%- for release in collections.release -%}
  <h1>{{ release.data.title }}</h1>
  {{ release.templateContent }}
{%- endfor -%}
