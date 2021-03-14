---
title: (Old) Browser Support
eleventyNavigation:
  key: (Old) Browser Support
  parent: Tools
  order: 7
---

{% todo %}

 - Intro content was moved to the Introduction.
 - This content should be integrated into the Tools overview.

{% endtodo %}

## Older browsers

To work on older browsers like Internet Explorer 11, there are 2 basic steps to take:

1. Build Lit’s modern Javascript to a compatible ES5 standard.
1. Include Lit’s `polyfill-support` module and the web components polyfills on the html page.  Note, the polyfills should be loaded separately from other built application code.

## Testing and development setup

For testing and development, we recommend using the tools from the [Modern Web](https://modern-web.dev/guides/) project as they have simple and robust support for older browsers.

 - See [Web Dev Server in the Development guide](/guide/tools/development#web-dev-server).

 - See [Web Test Runner in the Testing guide](/guide/tools/testing#web-test-runner).

## Building Javascript

Lit's use of ES2020 JavaScript is supported by modern browsers and Lit can be transpiled into ES5 code to run on older browsers. See [Building](/guide/tools/building/) for more information about how to build application and Lit component code into ES5.

Two extra scripts should be loaded:

1. Babel polyfills: this script is produced by the build and includes a set of Javascript polyfills needed for older browsers.
1. `custom-elements-es5-adapter.js`: When compiling code to ES5, browsers with native web components require a small polyfill.

<div class="alert alert-info">

Note, both of these scripts must be loaded before the web components polyfills and Lit's `polyfill-support` script.

</div>

## Loading polyfills

The `polyfill-support` module integrates Lit’s core library code with the web components polyfills. It is provided as a separate opt-in module to ensure the core code remains as small and efficient as possible for the majority of browsers that do not need it. The web components polyfills provide support in older browsers for custom elements, Shadow DOM, and style scoping.

The order scripts are loaded in the following order:
1. Babel and ES5-adapter
1. Lit's `polyfill-support` and the web components polyfills
1. Application code

Putting it all together, the page should load code as follows:

```html
<script src="nomodule/src/babel-polyfills-nomodule.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>

<script src="node_modules/lit/polyfill-support.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>

<!-- Load application code here -->
```

### Loading web components polyfills

There are two main ways to load the web components polyfills:

- `webcomponents-bundle.js` includes all of the polyfills necessary to run on any of the supported browsers. Because all browsers receive all polyfills, this results in extra bytes being sent to browsers that support one or more feature.
- `webcomponents-loader.js` performs client-side feature-detection and loads just the required polyfills. This requires an extra round-trip to the server, but saves bandwidth for browsers that support one or more features.

By default, the individual polyfill for a given feature is disabled on browsers that natively support that feature. For testing purposes, you can force the polyfills on for browsers that have native support. You can force the polyfills on by adding a JavaScript snippet before you import the polyfills:

### Setting web components polyfill options

```html
<script>
  // Force all polyfills on
  if (window.customElements) window.customElements.forcePolyfill = true;
  ShadyDOM = { force: true };
  ShadyCSS = { shimcssproperties: true};
</script>
<script src="./node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
```

The `webcomponents-bundle.js` file also supports forcing the polyfills on by adding query parameters to the app's URL:

`https://www.example.com/my-application/view1?wc-ce&wc-shadydom&wc-shimcssproperties`

The following table lists the JavaScript snippets and query parameters for each polyfill.

| Polyfill    | Javascript                          | Query parameter          |
|:------------|:------------------------------------|:-------------------------|
| Custom Elements | `if (window.customElements) window.customElements.forcePolyfill = true;` | `wc-ce` |
| Shadow DOM | `ShadyDOM = { force: true };` | `wc-shadydom`              |
| CSS custom properties | `ShadyCSS = { shimcssproperties: true};` | `wc-shimcssproperties` |
