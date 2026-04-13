---
title: Publish a component
eleventyNavigation:
  key: Publish a component
  parent: Tools
  order: 1
versionLinks:
  v2: tools/publishing/
  v3: tools/publishing/
---

This page describes how to publish a LitElement component to npm.

We recommend publishing JavaScript modules in standard ES2017. If you're writing your element in standard ES2017, you don't need to transpile for publication. If you're using TypeScript, or ES2017+ features such as decorators or class fields, you will need to transpile your element for publication.

## Publishing to npm

To publish your component to npm, <a href="https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry" target="_blank" rel="noopener">see the instructions on contributing npm packages</a>.

Your package.json configuration should have both the `main` and `module` fields:

**package.json**

```json
{
  "main": "my-element.js",
  "module": "my-element.js"
}
```

You should also create a README describing how to consume your component. A basic guide to consuming LitElement components is documented at [Use a component](/docs/v1/tools/use/).

## Transpiling with TypeScript

When compiling your code from TypeScript to JavaScript, we recommend targeting ES2017 with Node.js module resolution.

The following JSON sample is a partial tsconfig.json that uses recommended options for targeting ES2017:

```json
  "compilerOptions": {
    "target": "es2017",
    "module": "es2015",
    "moduleResolution": "node",
    "lib": ["es2017", "dom"],
    "experimentalDecorators": true
  }
```

See the <a href="https://www.typescriptlang.org/docs/handbook/tsconfig-json.html" target="_blank" rel="noopener">tsconfig.json documentation</a> for more information.

## Transpiling with Babel

To transpile a LitElement component that uses proposed JavaScript features, use Babel.

Install Babel and the Babel plugins you need. For example:

```
npm install --save-dev @babel/core
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-proposal-decorators
```

Configure Babel. For example:

**babel.config.js**

```js
const plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true } ],
];

module.exports = { plugins };
```

You can run Babel via a bundler plugin such as <a href="https://www.npmjs.com/package/rollup-plugin-babel" target="_blank" rel="noopener">rollup-plugin-babel</a>, or from the command line. See the <a href="https://babeljs.io/docs/en/" target="_blank" rel="noopener">Babel documentation</a> for more information.
