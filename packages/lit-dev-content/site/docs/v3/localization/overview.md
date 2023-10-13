---
title: Localization
eleventyNavigation:
  key: Overview
  parent: Localization
  order: 1
versionLinks:
  v2: localization/overview/
---

Localization is the process of supporting multiple languages and regions in your
apps and components. Lit has first-party support for localization through the
`@lit/localize` library, which has a number of advantages that can make it a
good choice over third-party localization libraries:

- Native support for expressions and HTML markup inside localized templates. No
  need for a new syntax and interpolation runtime for variable substitution—just
  use the templates you already have.

- Automatic re-rendering of Lit components when the locale switches.

- Only 1.27 KiB (minified + compressed) of extra JavaScript.

- Optionally compile for each locale, reducing extra JavaScript to 0 KiB.

## Installation

Install the `@lit/localize` client library and the `@lit/localize-tools`
command-line interface.

```sh
npm i @lit/localize
npm i -D @lit/localize-tools
```

## Quick start

1. Wrap a string or template in the `msg` function
   ([details](#making-strings-and-templates-localizable)).
2. Create a `lit-localize.json` config file ([details](#config-file)).
3. Run `lit-localize extract` to generate an XLIFF file ([details](#extracting-messages)).
4. Edit the generated XLIFF file to add a `<target>` translation tag
   ([details](#translation-with-xliff)).
5. Run `lit-localize build` to output a localized version of your strings and
   templates ([details](#output-modes)).

## Making strings and templates localizable

To make a string or Lit template localizable, wrap it in the `msg` function. The
`msg` function returns a version of the given string or template in whichever
locale is currently active.

<div class="alert alert-info">

Before you have any translations available, `msg` simply returns the original
string or template, so it's safe to use even if you're not yet ready to actually
localize.

</div>

{% switchable-sample %}

```ts
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {msg} from '@lit/localize';

@customElement('my-greeter')
class MyGreeter extends LitElement {
  @property()
  who = 'World';

  render() {
    return msg(html`Hello <b>${this.who}</b>`);
  }
}
```

```js
import {html, LitElement} from 'lit';
import {msg} from '@lit/localize';

class MyGreeter extends LitElement {
  static properties = {
    who: {},
  };

  constructor() {
    super();
    this.who = 'World';
  }

  render() {
    return msg(html`Hello <b>${this.who}</b>`);
  }
}
customElements.define('my-greeter', MyGreeter);
```

{% endswitchable-sample %}

### Message types

Any string or template that you would normally render with Lit can be localized,
including ones with dynamic expressions and HTML markup.

Plain string:

```js
msg('Hello World');
```

Plain string with expression (see [strings with
expressions](#strings-with-expressions) for details on `str`):

```js
msg(str`Hello ${name}`);
```

HTML template:

```js
msg(html`Hello <b>World</b>`);
```

HTML template with expression:

```js
msg(html`Hello <b>${name}</b>`);
```

Localized messages can also be nested inside HTML templates:

```js
html`<button>${msg('Hello World')}</button>`;
```

### Strings with expressions

Strings that contain an expression must be tagged with either `html` or `str` in
order to be localizable. You should prefer `str` over `html` when your string
doesn't contain any HTML markup, because it has slightly less performance
overhead. An error will be raised when you run the `lit-localize` command if you
forget the `html` or `str` tag on a string with an expression.

Incorrect:
<strike>

```js
import {msg} from '@lit/localize';
msg(`Hello ${name}`);
```

</strike>

Correct:

```js
import {msg, str} from '@lit/localize';
msg(str`Hello ${name}`);
```

The `str` tag is required in these cases because untagged template string
literals are evaluated to regular strings before they are received by the `msg`
function, which means dynamic expression values could not otherwise be captured
and substituted into the localized versions of the string.

## Locale codes

A locale code is a string that identifies a human language, and sometimes also
includes a region, script, or other variation.

Lit Localize does not mandate use any particular system of locale codes, though
it is strongly recommended to use the <a
href="https://www.w3.org/International/articles/language-tags/index.en"
target="_blank" rel="noopener">BCP 47 language tag standard</a>. Some examples
of BCP 47 language tags are:

- en: English
- es-419: Spanish spoken in Latin America
- zh-Hans: Chinese written in Simplified script

### Terms

Lit Localize defines a few terms that refer to locale codes. These terms are
used in this documentation, in the Lit Localize config file, and in the Lit
Localize API:

<dl class="params">
  <dt class="paramName">Source locale</dt>
  <dd class="paramDetails">
    <p>The locale that is used to write strings and templates in
    your source code.</p>
  </dd>

  <dt class="paramName">Target locales</dt>
  <dd class="paramDetails">
    <p>The locales that your strings and templates can be translated into.</p>
  </dd>

  <dt class="paramName">Active locale</dt>
  <dd class="paramDetails">
    <p>The global locale that is currently being displayed.</p>
  </dd>
</dl>

## Output modes

Lit Localize supports two output modes:

-  _Runtime_ mode uses Lit Localize's APIs to load localized messages at
   runtime.

-  _Transform_ mode eliminates the Lit Localize runtime code by building a
   separate JavaScript bundle for each locale.

<div class="alert alert-info">

**Unsure which mode to use?** Start with runtime mode. It's easy to switch modes
later because the core `msg` API is identical.

</div>

### Runtime mode

In runtime mode, one JavaScript or TypeScript module is generated for each of
your locales. Each module contains the localized templates for that locale. When
the active locale switches, the module for that locale is imported, and all
localized components are re-rendered.

Runtime mode makes switching locales very fast because a page reload is not
required. However, there is a slight performance cost to rendering performance
compared to transform mode.

#### Example generated output

```js
// locales/es-419.ts
export const templates = {
  hf71d669027554f48: html`Hola <b>Mundo</b>`,
};
```

See the [runtime mode](/docs/v3/localization/runtime-mode) page for full details
about runtime mode.

### Transform mode

In transform mode, a separate folder is generated for each locale. Each folder
contains a complete standalone build of your application in that locale, with
`msg` wrappers and all other Lit Localize runtime code completely removed.

Transform mode requires 0 KiB of extra JavaScript and is extremely fast to
render. However, switching locales requires re-loading the page so that a new
JavaScript bundle can be loaded.

#### Example generated output

```js
// locales/en/my-element.js
render() {
  return html`Hello <b>World</b>`;
}
```

```js
// locales/es-419/my-element.js
render() {
  return html`Hola <b>Mundo</b>`;
}
```

See the [transform mode](/docs/v3/localization/transform-mode) page for full
details about transform mode.

### Differences

<!-- TODO(aomarks) Default CSS doesn't have a margin above table -->
<br>

<table>
<thead>
<tr>
  <th></th>
  <th>Runtime mode</th>
  <th>Transform mode</th>
</tr>
</thead>

<tbody>
<tr>
  <td>Output</td>
  <td>A dynamically loaded module for each target locale.</td>
  <td>A standalone app build for each locale.</td>
</tr>

<tr>
  <td>Switch locales</td>
  <td>Call <code>setLocale()</code></td>
  <td>Reload page</td>
</tr>

<tr>
  <td>JS bytes</td>
  <td>1.27 KiB (minified + compressed)</td>
  <td>0 KiB</td>
</tr>

<tr>
  <td>Make template localizable</td>
  <td><code>msg()</code></td>
  <td><code>msg()</code></td>
</tr>

<tr>
  <td>Configure</td>
  <td><code>configureLocalization()</code></td>
  <td><code>configureTransformLocalization()</code></td>
</tr>

<tr>
  <td>Advantages</td>
  <td>
    <ul>
      <li>Faster locale switching.</li>
      <li>Fewer <em>marginal</em> bytes when switching locale.</li>
    </ul>
  </td>
  <td>
    <ul>
      <li>Faster rendering.</li>
      <li>Fewer bytes for a single locale.</li>
    </ul>
  </td>
</tr>
</tbody>
</table>

## Config file

The `lit-localize` command-line tool looks for a config file called
`lit-localize.json` in the current directory. Copy-paste the example below for a
quick start, and see the [CLI and config](/docs/v3/localization/cli-and-config)
page for a full reference of all options.

<div class="alert alert-info">

If you're writing JavaScript, set the `inputFiles` property to the location of
your `.js` source files. If you're writing TypeScript, set the `tsConfig`
property to the location of your `tsconfig.json` file, and leave `inputFiles`
blank.

</div>

{% switchable-sample %}

```ts
{
  "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
  "sourceLocale": "en",
  "targetLocales": ["es-419", "zh-Hans"],
  "tsConfig": "./tsconfig.json",
  "output": {
    "mode": "runtime",
    "outputDir": "./src/generated/locales"
  },
  "interchange": {
    "format": "xliff",
    "xliffDir": "./xliff/"
  }
}
```

```js
{
  "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
  "sourceLocale": "en",
  "targetLocales": ["es-419", "zh-Hans"],
  "inputFiles": [
    "src/**/*.js"
  ],
  "output": {
    "mode": "runtime",
    "outputDir": "./src/generated/locales"
  },
  "interchange": {
    "format": "xliff",
    "xliffDir": "./xliff/"
  }
}
```

{% endswitchable-sample %}

## Extracting messages

Run `lit-localize extract` to generate an <a
href="https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html" target="_blank"
rel="noopener">XLIFF</a> file for each target locale. XLIFF is an XML format
supported by most localization tools and services. XLIFF files will be written
to the directory specified by the `interchange.xliffDir` [config
option](/docs/v3/localization/cli-and-config/#xliff-mode-settings).

```sh
lit-localize extract
```

For example, given the source:

```js
msg('Hello World');
msg(str`Hello ${name}`);
msg(html`Hello <b>World</b>`);
```

Then a `<xliffDir>/<locale>.xlf` file will be generated for each target locale:

```xml
<!-- xliff/es-419.xlf -->

<trans-unit id="s3d58dee72d4e0c27">
  <source>Hello World</source>
</trans-unit>

<trans-unit id="saed7d3734ce7f09d">
  <source>Hello <x equiv-text="${name}"/></source>
</trans-unit>

<trans-unit id="hf71d669027554f48">
  <source>Hello <x equiv-text="&lt;b&gt;"/>World<x equiv-text="&lt;/b&gt;"/></source>
</trans-unit>
```

## Translation with XLIFF

XLIFF files can be edited manually, but more typically they are sent to a
third-party translation service where they are edited by language experts using
specialized tools.

After uploading your XLIFF files to your chosen translation service, you will
eventually receive new XLIFF files in response. The new XLIFF files will look
just like the ones you uploaded, but with `<target>` tags inserted into each
`<trans-unit>`.

When you receive new translation XLIFF files, save them to your configured
`interchange.xliffDir` directory, overwriting the original versions.

```xml
<!-- xliff/es-419.xlf -->

<trans-unit id="s3d58dee72d4e0c27">
  <source>Hello World</source>
  <target>Hola Mundo</target>
</trans-unit>

<trans-unit id="saed7d3734ce7f09d">
  <source>Hello <x equiv-text="${name}"/></source>
  <target>Hola <x equiv-text="${name}"/></target>
</trans-unit>

<trans-unit id="hf71d669027554f48">
  <source>Hello <x equiv-text="&lt;b&gt;"/>World<x equiv-text="&lt;/b&gt;"/></source>
  <target>Hola <x equiv-text="&lt;b&gt;"/>Mundo<x equiv-text="&lt;/b&gt;"/></target>
</trans-unit>
```

## Building localized templates

Use the `lit-localize build` command to incorporate translations back into your
application. The behavior of this command depends on the [output mode](#output-modes)
you have configured.

```sh
lit-localize build
```

See the [runtime mode](/docs/v3/localization/runtime-mode) and [transform
mode](/docs/v3/localization/transform-mode) pages for details of how building in
each mode works.

## Message descriptions

Use the `desc` option to the `msg` function to provide human-readable
descriptions for your strings and templates. These descriptions are shown to
translators by most translation tools, and are highly recommended to help
explain and contextualize the meaning of messages.

```js
render() {
  return html`<button>
    ${msg("Launch", {
      desc: "Button that begins rocket launch sequence.",
    })}
  </button>`;
}
```

Descriptions are represented in XLIFF files using `<note>` elements.

```xml
<trans-unit id="s512957aa09384646">
  <source>Launch</source>
  <note>Button that begins rocket launch sequence.</note>
</trans-unit>
```

## Message IDs

Lit Localize automatically generates an ID for every `msg` call using a hash of
the string.

If two `msg` calls share the same ID, then they are treated as the same message,
meaning they will be translated as a single unit and the same translations will
be substituted in both places.

For example, these two `msg` calls are in two different files, but since they
have the same content they will be treated as one message:

```js
// file1.js
msg('Hello World')

// file2.js
msg('Hello World')
```

### ID generation

The following content affects ID generation:

- String content
- HTML markup
- The position of expressions
- Whether the string is tagged with `html`

The following content **does not** affect ID generation:

- The code inside an expression
- The computed value of an expression
- Descriptions
- File location

For example, all of these messages share the same ID:

```js
msg(html`Hello <b>${name}</b>`);
msg(html`Hello <b>${this.name}</b>`);
msg(html`Hello <b>${this.name}</b>`, {desc: 'A friendly greeting'});
```

But this message has a different ID:

```js
msg(html`Hello <i>${name}</i>`);
```

### Overriding IDs

Message IDs can be overridden by specifying the `id` option to the `msg`
function. In some cases this may be necessary, such as when an identical string
has multiple meanings, because each might be written differently in another
language:

```js
msg('Buffalo', {id: 'buffalo-animal-singular'});
msg('Buffalo', {id: 'buffalo-animal-plural'});
msg('Buffalo', {id: 'buffalo-city'});
msg('Buffalo', {id: 'buffalo-verb'});
```
