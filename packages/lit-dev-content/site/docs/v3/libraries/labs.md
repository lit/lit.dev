---
title: Lit Labs
eleventyNavigation:
  key: Lit Labs
  parent: Related libraries
  order: 3
  labs: true
versionLinks:
  v2: libraries/labs/
---

Lit Labs is an umbrella for Lit packages under development that we are actively seeking feedback on. While we encourage real-world use in order to help the feedback process, please note:

- Lit Labs projects are published under the `@lit-labs` npm scope.
- Breaking changes are likely to occur more frequently than in non-labs packages, but they will still respect standard semantic versioning guildelines and all changes will be published to the CHANGELOG files.
- While we strive to address all bugs in a timely fashion, bugs in non-labs projects typically receive higher priority than bugs in labs projects.
- When a Lit Labs project is ready to graduate out of labs, we'll begin publishing it under the `@lit` scope. (For example, `@lit-labs/task` graduated to `@lit/task`.) Once a package graduates, its first version under the `@lit` scope will match that of the latest in `@lit-labs`—but only the `@lit` version will receive subsequent updates.
- We may decide to deprecate a Lit Labs project. In such cases, we will notify the community, and a deprecation warning will be added to the npm package. The deprecated package will receive bug fix support for at least 6 months. A record of historical labs packages will be kept on this page.

Feedback is currently being solicited on the following Labs packages:

<style>
  .labs-table-links {
    font-size: 0.9em;
    line-height: 1.5;
  }
</style>

<table class="directory">
<thead><tr><th>Package</th><th>Description</th><th>Links</th></tr></thead>
<tbody>
<tr class="subheading"><td colspan=3>Near graduation</td></tr>

<tr>
<td>

[scoped-registry-mixin](https://www.npmjs.com/package/@lit-labs/scoped-registry-mixin)

</td>
<td>

Mixin for Lit that integrates with the speculative [Scoped CustomElementRegistry polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/scoped-custom-element-registry).

</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/scoped-registry-mixin#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3364 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fscoped-registry-mixin%5D "Issues")

</td>
</tr>

<tr class="subheading"><td colspan=3>Under development</td></tr>

<tr>
<td>

[eleventy-plugin-lit](https://www.npmjs.com/package/@lit-labs/eleventy-plugin-lit)

</td>
<td>

A plugin for [Eleventy](https://www.11ty.dev) that pre-renders Lit components at build time, with optional hydration.

</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/eleventy-plugin-lit#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3356 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Feleventy-plugin-lit%5D "Issues")

</td>
</tr>

<tr>
<td>

[motion](https://www.npmjs.com/package/@lit-labs/motion)

</td>
<td>Animation helpers for Lit templates.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/motion#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3351 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fmotion%5D "Issues")

</td>
</tr>

<tr>
<td>

[observers](https://www.npmjs.com/package/@lit-labs/observers)

</td>
<td>A set of reactive controllers that facilitate using the platform observer objects.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/observers#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3355 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fobservers%5D "Issues")

</td>
</tr>

<tr>
<td>

[ssr](https://www.npmjs.com/package/@lit-labs/ssr)

</td>
<td>A package for server-side rendering Lit templates and components.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](/docs/v3/ssr/overview "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3353 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fssr%5D "Issues")

</td>
</tr>


<tr>
<td>

[testing](https://www.npmjs.com/package/@lit-labs/testing)

</td>
<td>A package containing testing utilities for Lit including generating server-side rendered fixtures.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/testing#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3359 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Ftesting%5D "Issues")

</td>
</tr>

<tr>
<td>

[virtualizer](https://www.npmjs.com/package/@lit-labs/virtualizer)

</td>
<td>A package that provides viewport-based virtualization (including virtual scrolling) for Lit.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/virtualizer#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3362 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fvirtualizer%5D "Issues")

</td>
</tr>

<tr class="subheading"><td colspan=3>Prototyping</td></tr>

<tr>
<td>

[analyzer](https://www.npmjs.com/package/@lit-labs/analyzer)

</td>
<td>A static analyzer for Lit.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/analyzer#readme "Docs")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fanalyzer%5D "Issues")

</td>
</tr>

<tr>
<td>

[cli](https://www.npmjs.com/package/@lit-labs/cli)

</td>
<td>A command line tool for Lit.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/cli#readme "Docs")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fcli%5D "Issues")

</td>
</tr>

<tr>
<td>

[compiler](https://www.npmjs.com/package/@lit-labs/compiler)

</td>
<td>A compiler for optimizing Lit templates.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/compiler#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/4117 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fcompiler%5D "Issues")

</td>
</tr>

<tr>
<td>

[preact-signals](https://www.npmjs.com/package/@lit-labs/preact-signals)

</td>
<td>Preact Signals integration for Lit.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/preact-signals#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/4115 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Fpreact-signals%5D "Issues")

</td>
</tr>

<tr>
<td>

[router](https://www.npmjs.com/package/@lit-labs/router)

</td>
<td>A component-oriented router API vended as reactive controllers.</td>
<td class="labs-table-links">

[📄&nbsp;Docs](https://github.com/lit/lit/tree/main/packages/labs/router#readme "Docs")<br>[💬&nbsp;Feedback](https://github.com/lit/lit/discussions/3354 "Feedback")<br>[🐞&nbsp;Issues](https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%5Blabs%2Frouter%5D "Issues")

</td>
</tr>

</tbody>
</table>
