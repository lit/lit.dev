---
title: Tools and workflows
eleventyNavigation:
  title: Tools and workflows
  key: Tools
  order: 7
  headingOnly: true
---

{% todo %}

- This file should not appear at all.

{% endtodo %}

lit-html is available from the npm registry. If you're already using npm to manage dependencies, you can use lit-html much like any other JavaScript library you install from npm. This section describes some additional tools or plugins you might want to add to your workflow to make it easier to work with lit-html.

lit-html is delivered as a set of JavaScript modules. If you aren't already using JavaScript modules in your project, you may need to add a couple of steps to your development and build workflow.


## Setup

The simplest way to add lit-html to a project is to install it from the npm registry.

1. If you're starting a brand-new project, run the following command in your project area to set up npm:

    ```bash
    npm init
    ```

    Respond to the prompts to set up your project. You can hit return to accept the default values.

2. Install lit-html.

    ```bash
    npm i lit-html
    ```


3. If you're working on a project with many front-end dependencies, you may want to use the npm  `dedupe` command to try and reduce duplicated modules:

    `npm dedupe`

## Development



## Testing


## Build

Build tools take your code and make it production-ready. Among the things you may need build tools to do:

* Transform ES6 code to ES5 for legacy browsers, including transforming JavaScript modules into other formats.
* Bundle modules together can improve performance by reducing the number of files that need to be transferred.
* Minify JavaScript, HTML, and CSS.

Many build tools can do this for you. Currently we recommend the Polymer CLI or webpack.

The Polymer CLI includes a set of build tools that can handle lit-html with minimal configuration.

webpack is a powerful build tool with a large ecosystem of plugins. The [Open Web Components](https://open-wc.org/building/#webpack) project provides a default configuration for webpack that works well for lit-html and LitElement.

Other tools such as Rollup can work, too. If you're using another tool or creating your own webpack configuration, see the section on [Build considerations for other tools](#build-consderations).

### Build your project with Polymer CLI

Originally developed to work with the Polymer library, the Polymer CLI can handle build duties for a variety of projects. It's not as flexible and extensible as webpack or Rollup, but it requires minimal configuration.

To build your project with the Polymer CLI, first install the Polymer CLI:

`npm i -g polymer-cli`

Create a `polymer.json` file in your project folder. A simple example would look like this:

```json
{
  "entrypoint": "index.html",
  "shell": "src/myapp.js",
  "sources": [
    "src/**.js",
    "manifest/**",
    "package.json"
  ],
  "extraDependencies": [
    "node_modules/@webcomponents/webcomponentsjs/bundles/**"
  ],
  "builds": [
    {"preset": "es6-bundled"}
  ]
}
```

This configuration specifies that the app has an HTML entrypoint called `index.html`, has a main JavaScript file (app shell) called `src/myapp.js`. It will produce a single build, bundled but not transpiled to ES5. For details on the polymer.json file, see [polymer.json specification](https://polymer-library.polymer-project.org/3.0/docs/tools/polymer-json) on the Polymer library site.

To build the project, run the following command in your project folder:

`polymer build`

For more on building with Polymer CLI, see [Build for production](https://polymer-library.polymer-project.org/3.0/docs/apps/build-for-production) in the Polymer library docs.

### Build your project with webpack


See the Open Web Components default webpack configuration provides a great starting point for building projects that use lit-html. See their [webpack page](https://open-wc.org/building/building-webpack.html#default-configuration) for instructions on getting started.

### Build considerations for other tools {#build-considerations}


If you're creating your own configuration for webpack, Rollup, or another tool, here are some factors to consider:

* ES6 to ES5 transpilation.
* Transforming JavaScript modules to other formats for legacy browsers.
* lit-html template minification.

#### Transpilation and module transform

You build tools need to transpile ES6 features to ES5 for legacy browsers.

If you're working in TypeScript, the TypeScript compiler can generate different output for different browsers.

* In general, ES6 is faster than the ES5 equivalent, so try to serve ES6 to browsers that support it.
* TypeScript has slightly buggy template literal support when compiling to ES5, which can hurt performance.

Your build tools need to accept JavaScript modules (also called ES modules) and transform them to another module format, such as UMD, if necessary. If you use node-style module specifiers, your build will also need to transform them to browser-ready modules specifiers.

#### Template minification

As part of the build process, you'll probably want to minify the HTML templates. Most HTML minifiers don't support HTML inside template literals, as used by lit-html, so you'll need to use a build plugin that supports minifying lit-html templates. Minifying lit-html templates can improve performance by reducing the number of nodes in a template.

* [Babel plugin](https://github.com/cfware/babel-plugin-template-html-minifier). For build chains that use Babel for transpilation. The open-wc webpack default configuration uses this plugin.
* [Rollup plugin](https://github.com/asyncLiz/rollup-plugin-minify-html-literals). If you're building your own Rollup configuration.
