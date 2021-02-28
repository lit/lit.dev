---
title: Localization
eleventyNavigation:
  parent: Localization
  key: Overview
  order: 1
---

## Install

Install the Lit localization client library, and the Lit command line interface.

```sh
npm i @lit/localize
npm i -D @lit/cli
```

## Msg

Wrap Lit templates in the `msg` function to make them localizable.

```ts
import {msg} from '@lit/localize';
import {html, LitElement, customElement, property} from 'lit';

@customElement('my-greeter');
class MyGreeter extends LitElement {
  @property()
  who: 'World';

  render() {
    return msg(html`Hello <b>${this.who}</b>!`);
  }
}
```

Before you have any translations available, the `msg` function simply returns
the unmodified template, so it's safe to start using even if you're not yet
ready for localization.

## Extract

Run `lit localize extract` command to generate an
[XLIFF](https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html) file for each
target locale. XLIFF is an XML format supported by many localization tools and
services.

```sh
lit localize extract
```

By default, XLIFF files will be written to the  `./xliff/` directory. Use the
`interchange.xliffDir` config setting to change this directory.

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

## Translate

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

### Reversish

Use the `reversish` command to generate translations for an imaginary locale
which simply reverses the contents of every template. You can use reversish to
experiment with the end-to-end localization process before you have real
localizations available.

```sh
lit localize reversish
```

```ts
html`!<b>${this.who}</b> olleH`
```

## Validate

Use the `validate` command to check on current translation coverage, and look
for any problems with the translations you already have.

```sh
$ lit localize validate

  Total messages: 47

  ------------------------------------------

  Coverage:

  en         <====================>  100%  (47 / 47)
  reversish  <====================>  100%  (47 / 47)
  es-419     <==================-->  90%   (42 / 47)
  zh_CN      <========------------>  40%   (19 / 47)

  ------------------------------------------

  Problems:

  1. Message h3c44aff2d5f5ef6b in locale es-419 is missing a placeholder

     Template:    html`Hello <b>${user}</b>!`
     Translation: html`Hola!`
     Location:    src/my-greeter.js line 10

```

## Build

Use the `lit localize build` command to incorporate translations back into your
application, using one of two modes.

### Transform mode

In transform mode (the default), Lit generates a separate folder for each
locale. Each folder contains a complete standalone build of your application in
that locale, with `msg` wrappers completely removed.


```sh
lit localize build
```

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

Transform mode has *zero* runtime overhead, so it is extremely fast to render.
The main downside of transform mode is that switching locales requires
re-loading your application.


### Runtime mode

In runtime mode, Lit generates one JS module for each of your locales,
containing the localized templates for that locale.

When your application switches locales, Lit imports the new template module, and
re-renders. Runtime mode makes switching locales very fast, but rendering
suffers a performance penalty compared to transform mode.

```sh
lit localize build --mode runtime
```

```ts
// locales/es-419.ts
export const templates = {
  h3c44aff2d5f5ef6b: html`Holda <b>Mundo!</b>`
}
```

## Switching locales

When using [runtime](#runtime) mode, you can switch locales dynamically, without
a page reload.

Note that in transform mode, switching locales requires re-loading your
application with a different client bundle. The remainder of this section
applies to runtime mode only.

### configureLocalization

To trigger a locale switch, you must first initialize the Lit localization
client library using `configureLocalization`. This tells Lit which locale
modules are available, and how to load them.

You can call this function yourself, but it's simpler to use the
`generate-configure-module` command to automatically generate a module that
calls it with the correct locale codes for your project, and exports the runtime
API.

```sh
lit localize generate-configure-module src/localize.ts
```

```ts
import {configureLocalization} from '@lit/localize';

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale: 'en',
  targetLocales: ['es-419', 'zh_CN'],
  loadLocale: (locale) => import(`/locales/${locale}.js`),
});
```

### setLocale

The `setLocale` function begins switching the active locale to the given code,
and returns a promise that resolves when the new locale has loaded.

```ts
// Generated module, see configureLocalization section above.
import {setLocale} from './localize.js';

const localeLoadedPromise = setLocale('es-419');
```

### Localized mixin

Apply the `Localized` mixin to your `LitElement` components to automatically
trigger a re-render whenever the locale changes.

```ts
import {Localized} from '@lit/localize/localized-element.js';
import {msg} from '@lit/localize';
import {LitElement, html} from 'lit-element';

class MyElement extends Localized(LitElement) {
  render() {
    // Whenever setLocale() is called, and templates for that locale have
    // finished loading, this render() function will be re-invoked.
    return msg(html`Hello <b>World!</b>`);
  }
}
```

### lit-localize-status event

The `lit-localize-status` event fires on `window` whenever a locale switch
starts, finishes, or fails. You can use this event to:

- Re-render when you can't use the `Localized` mixin (e.g. when using the Lit
  `render` function directly).

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

## Descriptions

Use comments containing the `@desc` JSDoc tag to provide human-readable
descriptions for your localized Lit templates.

```ts
render() {
  /** @desc Button that begins the space rocket launch sequence. */
  return html`<button>${msg('Launch')}</button`;
}
```

These descriptions are shown to translators, and are highly recommended to help
explain and contextualize the meaning of messages.

<aside class="best-practice">

**Best practice**: Provide detailed descriptions for *all* of your messages,
even if they seem unambiguous. The person translating your content often won't
see it in the context of your application, and might not have the same level of
familiarity with the terminology of your domain.

</aside>

## Message IDs

Every message needs a unique ID so that it can be tracked through the
translation process.

Message IDs are generated automatically based on a hash of the template
contents. All parts of a template affect the automatic ID, except for the
contents of expressions (though the *position* of expressions does affect the
ID).

### meaning

If two templates use identical text, but have two different meanings or context,
then it is important that the messages are distinguished, because those phrases
could be written differently in other locales.

Use the `meaning` option to distinguish two templates that would otherwise be
identical, so that two distinct messages are generated. This option acts as a
*salt* to the automatic ID generation hash, and is not visible to translators.

```ts
/** @desc Button that starts space rocket launch sequence. */
html`<button>${msg('Launch', {meaning: 'verb'})}</button>`;

/** @desc Heading above panel displaying rocket launch status. */
html`<h1>${msg('Launch', {meaning: 'noun'})}</h1>`;
```

### Override

If needed for rare situations, you can directly override the automatically
generated using the `id` option to `msg`.

```ts
msg(html`Hello <b>${user}</b>!`, {id: 'altId'});
```

## Placeholders

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

### ph

The `ph` function sets a more descriptive name and an optional example for a
placeholder expression. If `ph` is not used, translators will see the raw code
of the expression, and will not see an example.

```ts
import {msg, ph} from '@lit/localize';

msg(html`Hello ${ph(this.user, 'USERNAME', 'Jane Doe')}!`);
```

## Inflection

### plural

The `plural` function switches between variations of a message based on a
quantity.

```ts
import {msg, plural, other} from '@lit/localize';

msg(plural(this.numDrafts, {
  0: html`No drafts`,
  1: html`1 draft`,
  [other]: html`${this.numDrafts} drafts`,
}));
```

### select

The `select` function switches between variations of a message based on an
arbitrary criteria, often gender.

```ts
import {msg, select, other} from '@lit/localize';

msg(select(this.childGender, {
  female: html`Delete her account`,
  male: html`Delete his account`,
  [other]: html`Delete their account`,
}));
```

### genders

The `genders` function handles phrases that could *potentially* vary by gender
in a target locale, despite not varying by gender in the source locale.

It works by generating multiple permutations of a message for each of the 3
values `female`|`male`|`other`, using ICU `select` syntax. This allows
translators to enter a different translation for any or all of the permutations,
if needed.

You can use 1, 2, or 3 gender condition expressions in the first argument,
generating 3, 9, and 27 permutations respectively.

```ts
import {msg, genders} from '@lit/localize';

msg(genders([this.guardianGender, this.childGender],
  html`Do you want to delete your child's account?`));
```
