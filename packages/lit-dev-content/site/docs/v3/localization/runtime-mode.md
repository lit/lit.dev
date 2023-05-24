---
title: Runtime localization mode
eleventyNavigation:
  key: Runtime mode
  parent: Localization
  order: 2
versionLinks:
  v2: localization/runtime-mode/
---

In Lit Localize runtime mode, one JavaScript or TypeScript module is generated
for each of your locales. Each generated module contains the localized templates
for that locale. When your application switches locales, the module for that
locale is imported, and all localized components are re-rendered.

See [output modes](/docs/v3/localization/overview/#output-modes) for a comparison
of Lit Localize output modes.

#### Example output

```js
// locales/es-419.ts
export const templates = {
  h3c44aff2d5f5ef6b: html`Hola <b>Mundo!</b>`,
};
```

## Example of using runtime mode

The following example demonstrates an application built with Lit Localize
runtime mode:

{% playground-example "v3-docs/libraries/localization/runtime" "x-greeter.ts" %}

The Lit GitHub repo includes full working examples
([JavaScript](https://github.com/lit/lit/tree/main/packages/localize/examples/runtime-js),
[TypeScript](https://github.com/lit/lit/tree/main/packages/localize/examples/runtime-ts))
of Lit Localize runtime mode that you can use as templates.

## Configuring runtime mode

In your `lit-localize.json` config, set the `output.mode` property to `runtime`,
and set the `output.outputDir` property to the location where you would like
your localized template modules to be generated. See [runtime mode
settings](/docs/v3/localization/cli-and-config#runtime-mode-settings) for more
details.

Next, set `output.localeCodesModule` to a filepath of your chosing. Lit Localize
will generate a `.js` or `.ts` module here which mirrors the `sourceLocale` and
`targetLocales` settings in your config file as exported variables. The
generated module will look something like this:

```js
export const sourceLocale = 'en';
export const targetLocales = ['es-419', 'zh-Hans'];
export const allLocales = ['en', 'es-419', 'zh-Hans'];
```

Finally, in your JavaScript or TypeScript project, call `configureLocalization`,
passing an object with the following properties:

- `sourceLocale: string`: The `sourceLocale` variable exported by your generated
  `output.localeCodesModule` module.

- `targetLocales: string[]`: The `targetLocales` variable exported by your
  generated `output.localeCodesModule` module.

- `loadLocale: (locale: string) => Promise<LocaleModule>`: A function that loads
  a localized template. Returns a promise that resolves to the generated
  localized template module for the given locale code. See [Approaches for
  loading locale modules](#approaches-for-loading-locale-modules) for examples
  of functions you can use here.

`configureLocalization` returns an object with the following properties:

- `getLocale`: Function that returns the active locale code. If a new locale has
  started loading, `getLocale` will continue to return the previous locale code
  until the new one has finished loading.

- `setLocale`: Function that begins switching the active locale to the given
  code, and returns a promise that resolves when the new locale has loaded.
  Example usage:

For example:

```js
import {configureLocalization} from '@lit/localize';
// Generated via output.localeCodesModule
import {sourceLocale, targetLocales} from './generated/locales.js';

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`/locales/${locale}.js`),
});
```
## Automatically re-render

To automatically trigger a re-render of your component each time the active
locale switches, apply the `updateWhenLocaleChanges` function in your
`constructor` when writing JavaScript, or apply the `@localized` decorator to
your class when writing TypeScript.

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

@customElement('my-element');
@localized()
class MyElement extends LitElement {
  render() {
    // Whenever setLocale() is called, and templates for that locale have
    // finished loading, this render() function will be re-invoked.
    return msg(html`Hello <b>World!</b>`);
  }
}
```

```js
import {LitElement, html} from 'lit';
import {msg, updateWhenLocaleChanges} from '@lit/localize';

class MyElement extends LitElement {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  render() {
    // Whenever setLocale() is called, and templates for that locale have
    // finished loading, this render() function will be re-invoked.
    return msg(html`Hello <b>World!</b>`);
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

## Status event

The `lit-localize-status` event fires on `window` whenever a locale switch
starts, finishes, or fails. You can use this event to:

- Re-render when you can't use the `@localized` decorator (e.g. when using the
  Lit `render` function directly).

- Render as soon as a locale switch begins, even before it finishes loading
  (e.g. a loading indicator).

- Perform other localization related tasks (e.g. setting a locale preference
  cookie).

### Event types

The `detail.status` string property tells you what kind of status change has
occured, and can be either `loading`, `ready`, or `error`:

<dl class="params">
  <dt class="paramName">loading</dt>
  <dd class="paramDetails">
    <p>A new locale has started to load.</p>
    <p>The <code>detail</code> object contains:</p>
    <ul>
      <li><code>loadingLocale: string</code>: Code of the locale that has
      started loading.</li>
    </ul>
    <p>In the case that a second locale is requested before the first one
    finishes loading, a new <code>loading</code> event is dispatched, and no
    <code>ready</code> or <code>error</code> event will be dispatched for the
    first request.</p>
    <p>A <code>loading</code> status can be followed by a <code>ready</code>,
    <code>error</code>, or <code>loading</code> status.</p>
  </dd>

  <dt class="paramName">ready</dt>
  <dd class="paramDetails">
    <p>A new locale has successfully loaded and is ready for rendering.</p>
    <p>The <code>detail</code> object contains:</p>
    <ul>
      <li><code>readyLocale: string</code>: Code of the locale that has
      successfully loaded.</li>
    </ul>
    <p>A <code>ready</code> status can be followed only by a
    <code>loading</code> status.</p>
  </dd>

  <dt class="paramName">error</dt>
  <dd class="paramDetails">
    <p>A new locale failed to load.</p>
    <p>The <code>detail</code> object contains:</p>
    <ul>
      <li><code>errorLocale: string</code>: Code of the locale that failed to
      load.</li>
      <li><code>errorMessage: string</code>: Error message from locale load
      failure.</li>
    </ul>
    <p>An <code>error</code> status can be followed only by a
    <code>loading</code> status.</p>
  </dd>
</dl>

### Example of using the status event

```ts
// Show/hide a progress indicator whenever a new locale is loading,
// and re-render the application every time a new locale successfully loads.
window.addEventListener('lit-localize-status', (event) => {
  const spinner = document.querySelector('#spinner');

  if (event.detail.status === 'loading') {
    console.log(`Loading new locale: ${event.detail.loadingLocale}`);
    spinner.removeAttribute('hidden');
  } else if (event.detail.status === 'ready') {
    console.log(`Loaded new locale: ${event.detail.readyLocale}`);
    spinner.setAttribute('hidden', '');
    renderApplication();
  } else if (event.detail.status === 'error') {
    console.error(
      `Error loading locale ${event.detail.errorLocale}: ` +
        event.detail.errorMessage
    );
    spinner.setAttribute('hidden', '');
  }
});
```

## Approaches for loading locale modules

Lit Localize lets you load locale modules however you like, because you can pass
any function as the `loadLocale` option. Here are a few common patterns:

### Lazy-load

Use [dynamic
imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
to load each locale only when it becomes active. This is a good default because
it minimizes the amount of code that your users will download and execute.

```js
import {configureLocalization} from '@lit/localize';
import {sourceLocale, targetLocales} from './generated/locales.js';

const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`/locales/${locale}.js`),
});
```

### Pre-load

Start pre-loading all locales when the page loads. Dynamic imports are still
used to ensure that the remaining script on the page is not blocked while the
locale modules are being fetched.

```js
import {configureLocalization} from '@lit/localize';
import {sourceLocale, targetLocales} from './generated/locales.js';

const localizedTemplates = new Map(
  targetLocales.map((locale) => [locale, import(`/locales/${locale}.js`)])
);

const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => localizedTemplates.get(locale),
});
```

### Static imports

Use [static
imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
to pre-load all locales in a way that blocks other script on the page.

<div class="alert alert-warning">

This approach is not usually recommended because it will cause more code than
necessary to be fetched and executed before the rest of the script on the page
can execute, blocking interactivity. Use this approach only if your application
is extremely small, must be distributed in a single JavaScript file, or you have
some other restriction that prevents the use of dynamic imports.

</div>

```js
import {configureLocalization} from '@lit/localize';
import {sourceLocale, targetLocales} from './generated/locales.js';

import * as templates_es_419 from './locales/es-419.js';
import * as templates_zh_hans from './locales/zh-Hans.js';
...

const localizedTemplates = new Map([
  ['es-419', templates_es_419],
  ['zh-Hans', templates_zh_hans],
  ...
]);

const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => localizedTemplates.get(locale),
});
```
