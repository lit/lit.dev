---
title: Localization
eleventyNavigation:
  key: Localization
  parent: Related libraries
  order: 2
---

<div class="alert alert-labs">
  Lit localize is a <strong>Labs</strong> feature. It's ready to use, but
  is still in active development, so some additional features may be missing.
  Check the
  <a href="https://github.com/lit/lit/issues?q=is%3Aissue+is%3Aopen+localize" target="_blank" rel="noopener">
  open issues</a> for details.
</div>

Lit includes powerful support for localization/internationalization through the
`@lit/localize` package. Localization refers to the process of supporting
multiple languages and locales in your apps and components. `@lit/localize`
allows you to:

- Embed HTML markup and data expressions in your localized templates using
  natural Lit syntax, just by wrapping your templates in the
  [`msg`](#making-templates-localizable) function.

- [Extract messages](#extracting-messages) to standard XLIFF format for
  integration with all major translation services.

- In [*transform* mode](#transform-mode), generate a zero-overhead bundle for
  each locale, where all `msg` calls are replaced by localized templates that
  render as fast as possible.

- In [*runtime* mode](#runtime-mode), automatically re-render your app whenever
  the locale changes, just by adding the `@localized` decorator to your
  components.

## Example

{% playground-example "docs/libraries/localization/runtime" "x-greeter.ts" %}

## Installation

Install the `@lit/localize` client library and the `@lit/localize-tools`
command-line interface.

```sh
npm i @lit/localize
npm i -D @lit/localize-tools
```

## Making templates localizable

Wrapping a Lit template with the `msg()` function allows `@lit/localize-tools`
to extract it so that it can be sent for localization, and to replace it with
the localized version once available.

Before you have any translations available, `msg()` simply returns the
unmodified template, so it's safe to start using even if you're not yet ready
for localization.

{% switchable-sample %}

```ts
import {msg} from '@lit/localize';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-greeter');
class MyGreeter extends LitElement {
  @property()
  who = 'World';

  render() {
    return msg(html`Hello <b>${this.who}</b>!`);
  }
}
```

```js
import {msg} from '@lit/localize';
import {html, LitElement} from 'lit';

class MyGreeter extends LitElement {
  static properties = {
    who: {},
  };

  constructor() {
    super();
    this.who = 'World';
  }

  render() {
    return msg(html`Hello <b>${this.who}</b>!`);
  }
}
customElements.define('my-greeter', MyGreeter);
```

{% endswitchable-sample %}

## Build output modes

`@lit/localize` supports two build modes: *transform* and *runtime*, each with
their own advantages. It's easy to switch between the two, because the core
`msg` API is identical.

### Transform mode

In transform mode, Lit generates a separate folder for each locale. Each folder
contains a complete standalone build of your application in that locale, with
`msg` wrappers completely removed.

Transform mode has *zero* runtime overhead, so it is extremely fast to render.
However, switching locales requires re-loading your application with a different
JS bundle.

#### Sample output

```ts
// locales/en/my-element.js
render() {
  return html`Hello <b>World!</b>`;
}
```

```ts
// locales/es-419/my-element.js
render() {
  return html`Hola <b>Mundo!</b>`;
}
```

### Runtime mode

In runtime mode, Lit generates one JS module for each of your locales,
containing the localized templates for that locale.

When your application switches locales, Lit imports the new template module, and
re-renders. Runtime mode makes switching locales very fast, but rendering
suffers a performance penalty compared to transform mode.

#### Sample output

```ts
// locales/es-419.ts
export const templates = {
  h3c44aff2d5f5ef6b: html`Hola <b>Mundo!</b>`
}
```

## Config file

To start handling translations, create a JSON file called `lit-localize.json` in
your project's root directory.

```json
{
  "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
  "sourceLocale": "en",
  "targetLocales": ["es-419", "zh_CN"],
  "tsConfig": "./tsconfig.json",
  "output": {
    "mode": "transform"
  },
  "interchange": {
    "format": "xliff",
    "xliffDir": "./xliff/"
  }
}
```

### Config options

<dl class="params">
  <dt class="paramName">sourceLocale</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p>Required locale code that templates in the source code are written in.</p>
  </dd>

  <dt class="paramName">targetLocales</dt>
  <dd class="paramDetails">
    <code class="paramType">string[]</code>
    <p>Required locale codes that templates will be localized to.</p>
  </dd>

  <dt class="paramName">tsConfig</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p>Path to a <code>tsconfig.json</code> file that describes the TypeScript
       source files from which messages will be extracted.</p>
  </dd>

  <dt class="paramName">output.mode</dt>
  <dd class="paramDetails">
    <code class="paramType">"transform" | "runtime"</code>
    <p>What kind of output should be produced. See
       <a href="#build-output-modes">modes</a>.</p>
  </dd>

  <dt class="paramName">output.localeCodesModule</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p>Optional filepath for a generated TypeScript module that exports
      <code>sourceLocale</code>, <code>targetLocales</code>, and
      <code>allLocales</code> using the locale codes from your config file.
      Use to keep your config file and client config in sync.</p>
  </dd>

  <dt class="paramName">interchange.format</dt>
  <dd class="paramDetails">
    <code class="paramType">"xliff" | "xlb"</code>
    <p>Data format to be consumed by your localization process. Options:
      <ul>
        <li><code>"xliff"</code>:
          <a href="https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html" target="_blank" rel="noopener">
          XLIFF 1.2</a> XML format</li>
        <li><code>"xlb"</code>: Google-internal XML format</li>
      </ul>
    </p>
  </dd>

  <dt class="paramName">output.outputDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Transform mode only</em></p>
    <p>Output directory for generated TypeScript modules. Into this directory will
    be generated a <code>&lt;locale>.ts</code> for each <code>targetLocale</code>,
    each a TypeScript module that exports the translations in that locale keyed by
    message ID.</p>
  </dd>

  <dt class="paramName">interchange.xliffDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>XLIFF only</em></p>
    <p>Directory on disk to read/write <code>.xlf</code> XML files. For each target
    locale, the path <code>"&lt;xliffDir>/&lt;locale>.xlf"</code> will be used.</p>
  </dd>
</dl>

## Extracting messages

Run `lit-localize extract` command to generate an
<a href="https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html"
   target="_blank" rel="noopener">XLIFF</a>
file for each target locale. XLIFF is an XML format supported by many localization tools and
services. XLIFF files will be written to the directory specified by the
`interchange.xliffDir` [config option](#config-options).

```sh
lit-localize extract
```

```html
<xliff>
  <file target-language="es-419" source-language="en">
    <body>
      <trans-unit id="h3c44aff2d5f5ef6b">
        <source>Hello <ph>&lt;b&gt;${user}&lt;/b&gt;</ph>!</source>
        <target><!-- translation goes here --></target>
      </trans-unit>
    </body>
  </file>
</xliff>
```

## Translation with XLIFF

XLIFF files can be edited manually, but more typically they are sent to a
third-party translation service, where they are edited by language experts using
specialized tools.

After uploading an XLIFF file to your chosen translation service, you will
eventually receive a new XLIFF file in response. The new XLIFF file will look
just like the one you uploaded, but with `<target>` tags inserted into each
`<trans-unit>`.

```html
<trans-unit id="h3c44aff2d5f5ef6b">
  <source>Hello <ph>&lt;b&gt;${user}&lt;/b&gt;</ph>!</source>
  <target>Hola <ph>&lt;b&gt;${user}&lt;/b&gt;</ph>!</target>
</trans-unit>
</xliff>
```

When you receive a new translation XLIFF file, save it to your `xliff/`
directory, overwriting your original version.

## Building a localized app

Use the `lit-localize build` command to incorporate translations back into your
application. The behavior of this command depends on the
[mode](#build-output-modes) you have configured.

```sh
lit-localize build
```

## Switching locales

When using [runtime](#runtime-mode) mode, you can switch locales dynamically, without
a page reload.

<div class="alert alert-info">
Note that in transform mode, switching locales requires re-loading your
application with a different client bundle. The remainder of this section
applies to runtime mode only.
</div>

### Automatically re-render

To automatically trigger a re-render when the locale changes, apply the
`@localized` decorator to your class, or call the `updateWhenLocaleChanges`
function in your `constructor`.

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

@localized()
@customElement('my-element');
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

### configureLocalization

To trigger a locale switch, you must first initialize the Lit localization
client library using `configureLocalization`. This tells Lit which locale
modules are available and how to load them, and returns a `setLocale` function.

```ts
import {configureLocalization} from '@lit/localize';

export const {setLocale} = configureLocalization({
  sourceLocale: 'en',
  targetLocales: ['es-419', 'zh_CN'],
  loadLocale: (locale) => import(`/locales/${locale}.js`),
});
```

### setLocale

The `setLocale` function begins switching the active locale to the given code,
and returns a promise that resolves when the new locale has loaded.

```ts
const localeLoadedPromise = setLocale('es-419');
```

### lit-localize-status event

The `lit-localize-status` event fires on `window` whenever a locale switch
starts, finishes, or fails. You can use this event to:

- Re-render when you can't use the `@localized` decorator (e.g. when using the
  Lit `render` function directly).

- Render as soon as a locale switch begins, even before it finishes loading
  (e.g. a loading indicator, as in the example below).

- Perform other localization related tasks (e.g. setting a user locale
  preference cookie).

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

## Message descriptions

Use the `desc` option to provide human-readable descriptions for your localized
Lit templates. These descriptions are shown to translators, and are highly
recommended to help explain and contextualize the meaning of messages.

```ts
render() {
  return msg(html`<button>${msg('Launch')}</button`, {
    desc: 'Button that begins the space rocket launch sequence.'
  });
}
```

## Message IDs

Every message needs a unique ID so that it can be tracked through the
translation process.

Message IDs are generated automatically based on a hash of the template
contents. All parts of a template affect the automatic ID, except for the
contents of expressions (though the *position* of expressions does affect the
ID).

## Message placeholders

Lit splits your localizable templates into two categories: *localizable* parts
and *placeholder* parts. Placeholders are visible to translators, and can be
repositioned within the template, but their contents cannot be changed.

```ts
msg(html`Hello <b>${user}</b>!`);
```

- Localizable: `Hello`
- Placeholder: `<b>${user}</b>`
- Localizable: `!`

For example, in right-to-left scripts such as Arabic and Hebrew, placeholders
will typically move positions:

```ts
html`!<b>${user}</b> مرحبا`;
```
