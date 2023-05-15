---
title: Testing
eleventyNavigation:
  key: Testing
  parent: Tools
  order: 4
versionLinks:
  v1: lit-html/tools/#testing
  v2: tools/testing/
---

Testing ensures your code functions as you intend and saves you from tedious debugging.

See the [Starter Kits](/docs/v3/tools/starter-kits/) documentation for an easy to use setup with a fully pre-configured testing environment that works great for testing Lit components.

## Selecting a test framework

Lit is a standard modern Javascript library, and you can use virtually any Javascript testing framework to test your Lit code. There are many popular options, including [Jest](https://jestjs.io/), [Karma](https://karma-runner.github.io/), [Mocha](https://mochajs.org/), [Jasmine](https://jasmine.github.io/), and [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/).

There are a few things you'll want to make sure your testing environment supports to effectively test your Lit code.

### Testing in the browser

Lit components are designed to run in the browser so testing should be conducted in a browser environment. Tools specifically focusing on testing [node](https://nodejs.org/) code may not be a good fit.

<div class="alert alert-info">
While it's possible to test without a browser by shimming DOM calls, we don't recommend this approach since it won't test the code in the way your users experience it.
</div>

### Supporting modern Javascript

The test environment you use must have support for using modern Javascript, including using modules with bare module specifiers, or else down-leveling modern Javascript appropriately. See the [Requirements for legacy browsers](/docs/v2/tools/requirements/#building-for-legacy-browsers) documentation for more details.

### Using polyfills

To test on older browsers, your test environment will need to load some polyfills, including the [web components polyfills](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs) and Lit's `polyfill-support` module. See the [Polyfills](/docs/v2/tools/requirements/#polyfills) documentation for more details.

## Using Web Test Runner { #web-test-runner }

We recommend using [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) since it is specifically designed to test modern web libraries like Lit using modern web features like custom elements and shadow DOM. See the [Getting Started](https://modern-web.dev/guides/test-runner/getting-started) documentation for Web Test Runner.

In order to support older browsers, you need to configure Web Test Runner as follows:

Install `@web/dev-server-legacy`:

```bash
npm i @web/dev-server-legacy --save-dev
```

Setup  `web-test-runner.config.js`:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  /* ... */
  plugins: [
    // make sure this plugin is always last
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        // Inject lit's polyfill-support module into test files, which is required
        // for interfacing with the webcomponents polyfills
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test: "!('attachShadow' in Element.prototype)",
            module: false,
          },
        ],
      },
    }),
  ],
};
```

