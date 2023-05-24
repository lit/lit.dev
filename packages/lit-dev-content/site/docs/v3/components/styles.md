---
title: Styles
eleventyNavigation:
  key: Styles
  parent: Components
  order: 4
versionLinks:
  v1: components/styles/
  v2: components/styles/
---

Your component's template is rendered to its shadow root. The styles you add to your component are automatically _scoped_ to the shadow root and only affect elements in the component's shadow root.

Shadow DOM provides strong encapsulation for styling. If Lit did not use Shadow DOM, you would have to be extremely careful not to accidentally style elements outside of your component, either ancestors or children of your component. This might involve writing long, cumbersome to use class names. By using Shadow DOM, Lit ensures whatever selector you write only apply to elements in your Lit component's shadow root.

## Adding styles to your component {#add-styles}

You define scoped styles in the static `styles` class field using the tagged template literal `css` function. Defining styles this way results in the most optimal performance:

{% playground-example "v3-docs/components/style/basic" "my-element.ts" %}

The styles you add to your component are _scoped_ using shadow DOM. For a quick overview, see [Shadow DOM](#shadow-dom).

The value of the static `styles` class field can be:

*   A single tagged template literal.

    ```js
    static styles = css`...`;
    ```

*   An array of tagged template literals.

    ```js
    static styles = [ css`...`, css`...`];
    ```

The static `styles` class field is _almost always_ the best way to add styles to your component, but there are some use cases you can't handle this way—for example, customizing styles per instance. For alternate ways to add styles, see [Defining scoped styles in the template](#styles-in-the-template).


### Using expressions in static styles {#expressions}

Static styles apply to all instances of a component. Any expressions in CSS are evaluated **once**, then reused for all instances.

For tree-based or per-instance style customization, use CSS custom properties to allow elements to be [themed](#theming).

To prevent Lit components from evaluating potentially malicious code, the `css` tag only allows nested expressions that are themselves `css` tagged strings or numbers.

```js
const mainColor = css`red`;
...
static styles = css`
  div { color: ${mainColor} }
`;
```

This restriction exists to protect applications from security vulnerabilities whereby malicious styles, or even malicious code, can be injected from untrusted sources such as URL parameters or database values.

If you must use an expression in a `css` literal that is not itself a `css` literal, **and** you are confident that the expression is from a fully trusted source such as a constant defined in your own code, then you can wrap the expression with the `unsafeCSS` function:

```js
const mainColor = 'red';
...
static styles = css`
  div { color: ${unsafeCSS(mainColor)} }
`;
```

<div class="alert alert-info">

**Only use the `unsafeCSS` tag with trusted input.** Injecting unsanitized CSS is a security risk. For example, malicious CSS can "phone home" by adding an image URL that points to a third-party server.

</div>

### Inheriting styles from a superclass

Using an array of tagged template literals, a component can inherit the styles from a superclass, and add its own styles:

{% playground-ide "v3-docs/components/style/superstyles" %}

You can also use `super.styles` to reference the superclass's styles property in JavaScript. If you're using TypeScript, we recommend avoiding `super.styles` since the compiler doesn't always convert it correctly. Explicitly referencing the superclass, as shown in the example, avoids this issue.

When writing components intended to be subclassed in TypeScript, the `static styles` field should be explicitly typed as `CSSResultGroup` to allow flexibility for users to override `styles` with an array:

```ts
// Prevent typescript from narrowing the type of `styles` to `CSSResult`
// so that subclassers can assign e.g. `[SuperElement.styles, css`...`]`;
static styles: CSSResultGroup = css`...`;
```

### Sharing styles

You can share styles between components by creating a module that exports tagged styles:

```js
export const buttonStyles = css`
  .blue-button {
    color: white;
    background-color: blue;
  }
  .blue-button:disabled {
    background-color: grey;
  }`;
```

Your element can then import the styles and add them to its static `styles` class field:

```js
import { buttonStyles } from './button-styles.js';

class MyElement extends LitElement {
  static styles = [
    buttonStyles,
    css`
      :host { display: block;
        border: 1px solid black;
      }`
  ];
}
```

### Using unicode escapes in styles

CSS's unicode escape sequence is a backslash followed by four or six hex digits: for example, `\2022` for a bullet character. This similar to the format of JavaScript's deprecated _octal_ escape sequences, so using these sequences in a `css` tagged template literal causes an error.

There are two work-arounds for adding a unicode escape to your styles:

*   Add a second backslash (for example, `\\2022`).
*   Use the JavaScript escape sequence, starting with `\u` (for example, `\u2022`).

```js
static styles = css`
  div::before {
    content: '\u2022';
  }
```

## Shadow DOM styling overview {#shadow-dom}

This section gives a brief overview of shadow DOM styling.

Styles you add to a component can affect:

* [The shadow tree](#shadowroot) (your component's rendered template).
* [The component itself](#host).
* [The component's children](#slotted).


### Styling the shadow tree {#shadowroot}

Lit templates are rendered into a shadow tree by default. Styles scoped to an element's shadow tree don't affect the main document or other shadow trees. Similarly, with the exception of [inherited CSS properties](#inheritance), document-level styles don't affect the contents of a shadow tree.

When you use standard CSS selectors, they only match elements in your component's shadow tree. This means you can often use very simple selectors since you don't have to worry about them accidentally styling other parts of the page; for example: `input`, `*`, or `#my-element`.

### Styling the component itself {#host}

You can style the component itself using special `:host` selectors. (The element that owns, or "hosts" a shadow tree is called the _host element_.)

To create default styles for the host element, use the `:host` CSS pseudo-class and `:host()` CSS pseudo-class function.

*   `:host` selects the host element.
*   <code>:host(<var>selector</var>)</code> selects the host element, but only if the host element matches _selector_.

{% playground-example "v3-docs/components/style/host" "my-element.ts" %}

Note that the host element can be affected by styles from outside the shadow tree, as well, so you should consider the styles you set in `:host` and `:host()` rules as _default styles_ that can be overridden by the user. For example:

```css
my-element {
  display: inline-block;
}
```

### Styling the component's children {#slotted}

Your component may accept children (like a `<ul>` element can have `<li>` children). To render children, your template needs to include one or more `<slot>` elements, as described in [Render children with the slot element](/docs/v3/components/shadow-dom/#slots).

The `<slot>` element acts as a placeholder in a shadow tree where the host element's children are displayed.

Use the `::slotted()` CSS pseudo-element to select children that are included in your template via `<slot>`s.

*   `::slotted(*)` matches all slotted elements.
*   `::slotted(p)` matches slotted paragraphs.
*   `p ::slotted(*)` matches slotted elements where the `<slot>` is a descendant of a paragraph element.

{% playground-example "v3-docs/components/style/slottedselector" "my-element.ts" %}

Note that **only direct slotted children** can be styled with `::slotted()`.

```html
<my-element>
  <div>Stylable with ::slotted()</div>
</my-element>

<my-element>
  <div><p>Not stylable with ::slotted()</p></div>
</my-element>
```

Also, children can be styled from outside the shadow tree, so you should regard your `::slotted()` styles as default styles that can be overridden.

```css
my-element > div {
  /* Outside style targetting a slotted child can override ::slotted() styles */
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around slotted content.** See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for details on how to use the `::slotted()` syntax in a polyfill-friendly way.

</div>

## Defining scoped styles in the template {#styles-in-the-template}

We recommend using the [static `styles` class field](#add-styles) for optimal performance.  However, sometimes you may want to define styles in the Lit template. There are two ways to add scoped styles in the template:

*   Add styles using a [`<style>` element](#style-element).
*   Add styles using an [external style sheet](#external-stylesheet) (not recommended).

Each of these techniques has its own set of advantages and drawbacks.

### In a style element {#style-element}

Typically, styles are placed in the [static `styles` class field](#add-styles); however, the element's static `styles` are evaluated **once per class**. Sometimes, you might need to customize styles **per instance**. For this, we recommend using CSS properties to create [themable elements](#theming). Alternatively, you can also include `<style>` elements in a Lit template. These are updated per instance.

```js
render() {
  return html`
    <style>
      /* updated per instance */
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around per instance styling.** Per instance styling is not supported using the ShadyCSS polyfill. See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for details.

</div>

#### Expressions and style elements

Using expressions inside style elements has some important limitations and performance issues.

```js
render() {
  return html`
    <style>
      :host {
        /* Warning: this approach has limitations & performance issues! */
        color: ${myColor}
      }
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around expressions.** Expressions in `<style>` elements won't update per instance in ShadyCSS, due to limitations of the ShadyCSS polyfill. In addition, `<style>` nodes may not be passed as expression values when using the ShadyCSS polyfill. See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for more information.

</div>

Evaluating an expression inside a `<style>` element is extremely inefficient. When any text inside a `<style>` element changes, the browser must re-parse the whole `<style>` element, resulting in unnecessary work.

To mitigate this cost, separate styles that require per-instance evaluation from those that don't.

```js
  static styles = css`/* ... */`;
  render() {
    const redStyle = html`<style> :host { color: red; } </style>`;
    return html`${this.red ? redStyle : ''}`

```

### Import an external stylesheet (not recommended) {#external-stylesheet}

While you can include an external style sheet in your template with a `<link>`, we do not recommend this approach. Instead, styles should be placed in the [static `styles` class field](#add-styles).

<div class="alert alert-info">

**External stylesheet caveats.**

*  The [ShadyCSS polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) doesn't support external style sheets.
*   External styles can cause a flash-of-unstyled-content (FOUC) while they load.
*   The URL in the `href` attribute is relative to the **main document**. This is okay if you're building an app and your asset URLs are well-known, but avoid using external style sheets when building a reusable element.

</div>

## Dynamic classes and styles

One way to make styles dynamic is to add expressions to the `class` or `style` attributes in your template.

Lit offers two directives, `classMap` and `styleMap`, to conveniently apply classes and styles in HTML templates.

For more information on these and other directives, see the documentation on [built-in directives](/docs/v3/templates/directives/).

To use `styleMap` and/or `classMap`:

1.  Import `classMap` and/or `styleMap`:

    ```js
    import { classMap } from 'lit/directives/class-map.js';
    import { styleMap } from 'lit/directives/style-map.js';
    ```

2.  Use `classMap` and/or `styleMap` in your element template:

{% playground-example "v3-docs/components/style/maps" "my-element.ts" %}

See [classMap](/docs/v3/templates/directives/#classmap) and [styleMap](/docs/v3/templates/directives/#stylemap) for more information.

## Theming {#theming}

By using [CSS inheritance](#inheritance) and [CSS variables and custom properties](#customprops) together, it's easy to create themable elements. By applying css selectors to customize CSS custom properties, tree-based and per-instance theming is straightforward to apply. Here's an example:

{% playground-example "v3-docs/components/style/theming" "my-element.ts" %}

### CSS inheritance {#inheritance}

CSS inheritance lets parent and host elements propagate certain CSS properties to their descendants.

Not all CSS properties inherit. Inherited CSS properties include:

* `color`
* `font-family` and other `font-*` properties
* All CSS custom properties (`--*`)

See [CSS Inheritance on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance) for more information.

You can use CSS inheritance to set styles on an ancestor element that are inherited by its descendants:

```html
<style>
html {
  color: green;
}
</style>
<my-element>
  #shadow-root
    Will be green
</my-element>
```

### CSS custom properties {#customprops}

All CSS custom properties (<code>--<var>custom-property-name</var></code>) inherit. You can use this to make your component's styles configurable from outside.

The following component sets its background color to a CSS variable. The CSS variable uses the value of `--my-background` if it's been set by a selector matching an ancestor in the DOM tree, and otherwise defaults to `yellow`:

```js
class MyElement extends LitElement {
  static styles = css`
    :host {
      background-color: var(--my-background, yellow);
    }
  `;
  render() {
    return html`<p>Hello world</p>`;
  }
}
```

Users of this component can set the value of `--my-background`, using the `my-element` tag as a CSS selector:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
</style>
<my-element></my-element>
```

`--my-background` is configurable per instance of `my-element`:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
  my-element.stuff {
    --my-background: #111111;
  }
</style>
<my-element></my-element>
<my-element class="stuff"></my-element>
```

See [CSS Custom Properties on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for more information.
