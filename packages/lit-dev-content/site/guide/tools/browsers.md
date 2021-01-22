---
title: Browser Support
eleventyNavigation:
  key: Browser Support
  parent: Tools
  order: 7
---

Lit works on modern browsers, including Chrome, Firefox, Edge, and Safari as well as any browsers based on the Webkit, Gecko, or Blink rendering engines. Lit uses modern Javascript features like bare module specifiers, classes, and modules, as well as web platform features like web components. The library guarantees support for at least the last 2 major versions of modern browsers.

The following table lists browser versions that support the features on which Lit relies. For the browsers not supporting these features natively, they are supported either via polyfills or by producing a compatible build.

| Browser  | Module Specifiers     | Modern JS      | Web Components       |
|:---------|:---------------------:|:--------------:|:--------------------:|
| Chrome   | 90                    | 80             | 67                   |
| Safari   | build                 | 13             | 10                   |
| Firefox  | build                 | 72             | 63                   |
| Edge (Chromium) | build          | 80             | 79                   |
| Edge 14-18 | build               | build          | polyfill             |
| Internet Explorer 11 | build     | build          | polyfill             |

## Older Browsers

To work on older browsers like Internet Explorer 11, there are 2 basic steps to take:

1. Build Lit’s modern Javascript to a compatible ES5 standard.
1. Include Lit’s `polyfill-support` module and the web components polyfills on the html page.  Note, the polyfills should be loaded separately from other built application code.

## Building Javascript

Lit uses modern Javascript features like modules, classes, and other recent syntax additions. All of these features can be transpiled into ES5 code which runs on older browsers. See [Building](./building) for more information about how to build application and Lit component code into ES5.

When compiling code to ES5, browsers with native web components require a small polyfill, the`custom-elements-es5-adapter.js`. Using a single ES5 build for all browsers is useful in static serving environments. Important note: the ES5 adapter must come before the web components polyfills, if any.

## Loading Polyfills

The `polyfill-support` module integrates Lit’s core library code with the web components polyfills. It is provided as a separate opt-in module to ensure the core code remains as small and efficient as possible for the majority of browsers that do not need it. The web components polyfills provide support in older browsers for custom elements, Shadow DOM, and style scoping. Both should be loaded before any other Lit component or library code.

```html
<script src="node_modules/lit/polyfill-support.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Load application code here -->
```

There are two main ways to load the web components polyfills:

- `webcomponents-bundle.js` includes all of the polyfills necessary to run on any of the supported browsers. Because all browsers receive all polyfills, this results in extra bytes being sent to browsers that support one or more feature.
- `webcomponents-loader.js` performs client-side feature-detection and loads just the required polyfills. This requires an extra round-trip to the server, but saves bandwidth for browsers that support one or more features.

By default, the individual polyfill for a given feature is disabled on browsers that natively support that feature. For testing purposes, you can force the polyfills on for browsers that have native support. You can force the polyfills on by adding a JavaScript snippet before you import the polyfills:

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
