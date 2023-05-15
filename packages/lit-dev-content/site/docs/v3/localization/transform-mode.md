---
title: Transform localization mode
eleventyNavigation:
  key: Transform mode
  parent: Localization
  order: 3
versionLinks:
  v2: localization/transform-mode/
---

In Lit Localize transform mode, a separate folder is generated for each locale.
Each folder contains a complete standalone build of your application in that
locale, with all runtime `@lit/localize` code removed:

- `msg` calls are replaced with the static localized version of the string or
  template in each locale.
- `str` tags are removed.
- `@lit/localize` imports are removed.
- Templates are optimized to remove unnecessary expressions by folding them into
  parent templates wherever possible.

For example, given the source:

```js
// src/launch-button.js
import {msg} from '@lit/localize';

render() {
  return html`<button>${msg('Launch rocket')}</button>`
}
```

The following files will be generated:

```js
// locales/en/launch-button.js
render() {
  return html`<button>Launch rocket</button>`
}

// locales/es-419/launch-button.js
render() {
  return html`<button>Lanza cohete</button>`
}
```

## Configuring transform mode

In your `lit-localize.json` config, set the `mode` property to `transform`, and
set the `output.outputDir` property to the location where you would like your
localized app folders to be generated. See [transform mode
settings](/docs/v3/localization/cli-and-config#transform-mode-settings) for more
details.

In your JavaScript or TypeScript project, optionally call
`configureTransformLocalization`, passing an object with the following
property:

- `sourceLocale: string`: Locale in which source templates are written.
  Specified as a locale code (for example: `"en"`).

`configureTransformLocalization` returns an object with the following property:

- `getLocale`: Function that returns the active locale code.

For example:

```js
import {configureTransformLocalization} from '@lit/localize';

export const {getLocale} = configureTransformLocalization({
  sourceLocale: 'en',
});
```

## Setting the initial locale

In transform mode, the active locale is determined by the JavaScript bundle you
load. How you determine which bundle to load when your page loads is up to you.

For example, if your application's locale is reflected in the URL path, you can
include an inline script in your HTML file that checks the URL and inserts the
appropriate `<script>` tag:

<div class="alert alert-warning">

Always validate your locale codes when dynamically choosing a script name. The
example below is safe because a script can only be loaded if it matches one of
our known locale codes, but if our matching logic was less precise, it could
result in bugs or attacks that inject insecure JavaScript.

</div>

```js
import {allLocales} from './generated/locales.js';

const url = new URL(window.location.href);
const unsafeLocale = url.searchParams.get('locale');
const locale = allLocales.includes(unsafeLocale) ? unsafeLocale : 'en';

const script = document.createElement('script');
script.type = 'module';
script.src = `/${locale}.js`;
document.head.appendChild(script);
```

For better performance, you can statically render the appropriate script tag
into your HTML file on the server. This lets the browser start downloading your
script as early as possible.

## Switching locales

In transform mode, the `setLocale` function is not available. Instead, reload
the page so that the next load will pick a different locale bundle.

For example, this `locale-picker` custom element loads a new URL whenever a new
locale is selected from a drop-down list:

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {getLocale} from './localization.js';
import {allLocales} from './generated/locales.js';

@customElement('locale-picker');
export class LocalePicker extends LitElement {
  render() {
    return html`
      <select @change=${this.localeChanged}>
        ${allLocales.map(
          (locale) =>
            html`<option value=${locale} selected=${locale === getLocale()}>
              ${locale}
            </option>`
        )}
      </select>
    `;
  }

  localeChanged(event: Event) {
    const newLocale = (event.target as HTMLSelectElement).value;
    const url = new URL(window.location.href);
    if (url.searchParams.get('locale') !== newLocale) {
      url.searchParams.set('locale', newLocale);
      window.location.assign(url.href);
    }
  }
}
```

```js
import {LitElement, html} from 'lit';
import {getLocale} from './localization.js';
import {allLocales} from './generated/locales.js';

export class LocalePicker extends LitElement {
  render() {
    return html`
      <select @change=${this.localeChanged}>
        ${allLocales.map(
          (locale) =>
            html`<option value=${locale} selected=${locale === getLocale()}>
              ${locale}
            </option>`
        )}
      </select>
    `;
  }

  localeChanged(event) {
    const newLocale = event.target.value;
    const url = new URL(window.location.href);
    if (url.searchParams.get('locale') !== newLocale) {
      url.searchParams.set('locale', newLocale);
      window.location.assign(url.href);
    }
  }
}
customElements.define('locale-picker', LocalePicker);
```

{% endswitchable-sample %}

## Rollup integration

If you use <a href="https://rollupjs.org/" target="_blank"
rel="noopener">Rollup</a>, and would prefer an integrated solution instead of
running the `lit-localize build` command separately, import the
`localeTransformers` function from `@lit/localize-tools/lib/rollup.js` into your
Rollup config.

This function generates an array of `{locale, transformer}` objects, which you
can use in conjunction with the
<a href="https://github.com/rollup/plugins/tree/master/packages/typescript/#transformers" target="_blank" rel="noopener">transformers</a>
option of
<a href="https://www.npmjs.com/package/@rollup/plugin-typescript" target="_blank" rel="noopener">@rollup/plugin-typescript</a>
to generate a separate bundle for each locale.

<div class="alert alert-info">

If you write JavaScript, don't worry about seeing the TypeScript compiler used
here. Lit Localize depends on the TypeScript compiler to parse, analyze, and
transform your source code, but it handles plain JavaScript files too!

</div>

The following `rollup.config.mjs` generates a minified bundle for each of your
locales into `./bundled/<locale>/` directories:


{% switchable-sample %}

```ts
import typescript from '@rollup/plugin-typescript';
import {localeTransformers} from '@lit/localize-tools/lib/rollup.js';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

// Config is read from ./lit-localize.json by default.
// Pass a path to read config from another location.
const locales = localeTransformers();

export default locales.map(({locale, localeTransformer}) => ({
  input: `src/index.ts`,
  plugins: [
    typescript({
      transformers: {
        before: [localeTransformer],
      },
    }),
    resolve(),
    terser(),
  ],
  output: {
    file: `bundled/${locale}/index.js`,
    format: 'es',
  },
}));
```

```js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import summary from 'rollup-plugin-summary';
import {localeTransformers} from '@lit/localize-tools/lib/rollup.js';

// Config is read from ./lit-localize.json by default.
// Pass a path to read config from another location.
const locales = localeTransformers();

export default locales.map(({locale, localeTransformer}) => ({
  input: `src/index.js`,
  plugins: [
    typescript({
      transformers: {
        before: [localeTransformer],
      },
      // Specifies the ES version and module format to emit. See
      // https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
      tsconfig: 'jsconfig.json',
      // Temporary directory where transformed modules will be emitted before
      // Rollup bundles them.
      outDir: 'bundled/temp',
      // @rollup/plugin-typescript always matches only ".ts" files, regardless
      // of any settings in our jsconfig.json.
      include: ['src/**/*.js'],
    }),
    resolve(),
    terser(),
    summary({
      showMinifiedSize: false,
    }),
  ],
  output: {
    file: `bundled/${locale}/index.js`,
    format: 'es',
    sourcemap: true,
  },
}));
```

{% endswitchable-sample %}
