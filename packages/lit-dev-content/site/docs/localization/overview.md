---
title: Localization
eleventyNavigation:
  key: Overview
  parent: Localization
  order: 1
---

Localization is the process of supporting multiple languages and regions in your
apps and components. Lit has first-party support for localization through the
`@lit/localize` library, which has a number of advantages that can make it a
good choice over third-party localization libraries:

- Native support for expressions and HTML markup inside localized templates. No
  need for a new syntax and interpolation runtime for variable substitution —
  just use the templates you already have.

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

@customElement('my-greeter');
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

If a string contains an expression and doesn't need to be tagged with `html`,
then it must be tagged with `str` in order to be localizable. An error will be
raised during extraction if you forget to include the `str` tag.

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

- `en`: English
- `es-419`: Spanish spoken in Latin America
- `zh-Hans`: Chinese written in Simplified script

Lit Localize defines a few important locale values:

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

Lit Localize supports two output modes: _runtime_ and _transform_, each with
their own advantages.

<div class="alert alert-info">

Don't worry too much about which mode to use at first. It's easy to switch
between the two because the core `msg` API is identical. If unsure, start with
runtime mode.

</div>

### Runtime mode

In runtime mode, one JavaScript or TypeScript module is generated for each of
your locales. Each module contains the localized templates for that locale. When
the active locale switches, the module for that locale is imported, and all
components are re-rendered.

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

See the [runtime mode](/docs/localization/runtime-mode) page for full details
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

See the [transform mode](/docs/localization/transform-mode) page for full
details about transform mode.

### Differences

<!-- TODO(aomarks) Default CSS doesn't have a margin above table -->
<br>

|                           | Runtime mode                                                                | Transform mode                                          |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| Output                    | A dynamically loaded module for each target locale.                         | A standalone app build for each locale.                 |
| Switch locales            | Call `setLocale()`                                                          | Reload page                                             |
| JS bytes                  | 1.27 KiB (minified + compressed)                                            | 0 KiB                                                   |
| Make template localizable | `msg()`                                                                     | `msg()`                                                 |
| Configure                 | `configureLocalization()`                                                   | `configureTransformLocalization()`                      |
| Advantages                | - Faster locale switching<br>- Fewer _marginal_ bytes when switching locale | - Faster rendering<br>- Fewer bytes for a single locale |

## Config file

The `lit-localize` command-line tool looks for a config file called
`lit-localize.json` in the current directory. Copy-paste the example below for a
quick start, and see the [CLI and config](/docs/localization/cli-and-config)
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
    "mode": "runtime"
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
    "src/**/*.js",
  ]
  "output": {
    "mode": "runtime"
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
option](/docs/localization/cli-and-config/#xliff-mode-settings).

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
third-party translation service, where they are edited by language experts using
specialized tools.

After uploading an XLIFF file to your chosen translation service, you will
eventually receive a new XLIFF file in response. The new XLIFF file will look
just like the one you uploaded, but with `<target>` tags inserted into each
`<trans-unit>`.

When you receive a new translation XLIFF file, save it to your `xliff/`
directory, overwriting your original version.

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
application. The behavior of this command depends on the [mode](#output-modes)
you have configured.

```sh
lit-localize build
```

See the [runtime mode](/docs/localization/runtime-mode) and [transform
mode](/docs/localization/transform-mode) pages for details of how building in
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

Descriptions will be represented in XLIFF files using `<note>` elements.

```xml
<trans-unit id="s512957aa09384646">
  <source>Launch</source>
  <note>Button that begins rocket launch sequence.</note>
</trans-unit>
```

## Message ids

Lit Localize automatically generates an id for every `msg` call using a hash of
the string contents, including HTML markup.

If two `msg` calls share the same id, then they are treated as the same message,
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

If a string contains an expression (e.g. `${foo}`), then the content of the
expression does **not** affect the id, though the presence and position of the
expression does.

For example, these two messages have the same id:

```js
// Same id
msg(`Hello ${name}`)
msg(`Hello ${this.name}`);
```

Message ids can be overridden by specifying the `id` option to the `msg`
function. In some cases this may be necessary, such as when an identical string
has multiple meanings, because each might be written differently in another
language:

```js
msg('Buffalo', {id: 'buffalo-animal-singular'});
msg('Buffalo', {id: 'buffalo-animal-plural'});
msg('Buffalo', {id: 'buffalo-city'});
msg('Buffalo', {id: 'buffalo-verb'});
```
