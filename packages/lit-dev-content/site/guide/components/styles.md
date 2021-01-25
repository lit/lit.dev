---
title: Styles
eleventyNavigation:
  key: Styles
  parent: Components
  order: 5
---

Your component's template is rendered to its shadow DOM tree. The styles you add to your component are automatically _scoped_ to the shadow tree, so they don't leak out and affect other elements.

## Adding styles to your component {#add-styles}

For optimal performance, define scoped styles in a static `styles` property.

Define styles in a tagged template literal, using the `css` tag function:

{% playground-ide "docs/templates/shadowroot/" %}

The styles you add to your component are _scoped_ using shadow DOM. For a quick overview, see [Shadow DOM](#shadow-dom).

The value of the static `styles` property can be:

*   A single tagged template literal.

    ```ts
    static styles = css`...`;
    ```

*   An array of tagged template literals.

    ```ts
    static styles = [ css`...`, css`...`];
    ```

The static `styles` property is _usually_ the best way to add styles to your component, but
there are some use cases you can't handle this way—for example, linking to an external style sheet. For alternate ways to add styles, see [Define scoped styles in the template](#styles-in-the-template).

### Using expressions in static styles {#expressions}

Static styles apply to all instances of a component. Any expressions in CSS are evaluated **once**, then reused for all instances.

To allow for theming or per-instance style customization, use CSS variables and custom properties to create [configurable styles](#configurable).

To prevent LitElement-based components from evaluating potentially malicious code, the `css` tag only allows nested expressions that are themselves `css` tagged strings or numbers.

{% playground-ide "style/nestedcss" %}

This restriction exists to protect applications from security vulnerabilities whereby malicious styles, or even malicious code, can be injected from untrusted sources such as URL parameters or database values.

If you must use an expression in a `css` literal that is not itself a `css` literal, **and** you are confident that the expression is from a fully trusted source such as a constant defined in your own code, then you can wrap the expression with the `unsafeCSS` function:

{% playground-ide "style/unsafecss" %}

<div class="alert alert-warning">

**Only use the `unsafeCSS` tag with trusted input.** Injecting unsanitized CSS is a security risk. For example,
malicious CSS can "phone home" by adding an image URL that points to a third-party server.

</div>

### Inheriting styles

Using an array of tagged template literals, a component can inherit the styles from a LitElement superclass, and add its own styles:

{% playground-ide "style/superstyles" %}

### Sharing styles

You can share styles between components by creating a module that exports tagged
styles:

```js
import { css } from 'lit-element';

export const buttonStyles = css`
  .blue-button {
    color: white;
    background-color: blue;
  }
  .blue-button:disabled {
    background-color: grey;
  }`;
```

Your element can then import the styles and add them to its static `styles` property:

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

You can also import an external style sheet by adding a `<link>` element to your template, but this has a number of limitations. For details, see [Import an external stylesheet](#external-stylesheet).

## Shadow DOM styling overview {#shadow-dom}

This section gives a brief overview of shadow DOM styling.

Styles you add to a component can affect:

* The shadow tree (your component's rendered template).
* The component itself.
* The component's children.


### Styling the shadow tree {#shadowroot}

LitElement templates are rendered into a shadow tree by default. Styles scoped to an element's shadow tree don't affect the main document or other shadow trees. Similarly, with the exception of [inherited CSS properties](#inheritance), document-level styles don't affect the contents of a shadow tree.

When you use standard CSS selectors, they only match elements in your component's shadow tree.

{% playground-ide "style/styleatemplate" %}

### Styling the component itself

You can style the component itself using special `:host` selectors. (The element that owns, or "hosts" a shadow tree is called the _host element_.)

To create default styles for the host element, use the `:host` CSS pseudo-class and `:host()` CSS pseudo-class function.

*   `:host` selects the host element.

*   <code>:host(<var>selector</var>)</code> selects the host element, but only if the host element matches _selector_.

{% playground-ide "style/host" %}

Note that the host element can be affected by styles from outside the shadow tree, as well, so you should consider
the styles you set in `:host` and `:host()` rules as _default styles_ that can be overridden by the user. For example:

```css
my-element {
  display: inline-block;
}
```

### Styling the component's children

Your component may accept children (like a `<ul>` element can have `<li>` children). To render children, your template needs to include one or more `<slot>` elements, as described in [Render children with the slot element](../shadow-dom#slots).

The `<slot>` element acts as a placeholder in a shadow tree where the host element's children are displayed.

Use the `::slotted()` CSS pseudo-element to select children that are included in your template via `<slot>`s.

*   `::slotted(*)` matches all slotted elements.

*   `::slotted(p)` matches slotted paragraphs.

*   `p ::slotted(*)` matches slotted elements where the `<slot>` is a descendant of a paragraph element.

{% playground-ide "style/slottedselector" %}

Note that **only direct slotted children** can be styled with `::slotted()`.

```html
<my-element>
  <div>Stylable with ::slotted()</div>
</my-element>

<my-element>
  <div><p>Not stylable with ::slotted()</p></div>
</my-element>
```

Also, children can
be styled from outside the shadow tree, so you should regard your `::slotted()` styles as
default styles that can be overridden.

```css
my-element div {
  // Outside style targetting a slotted child can override ::slotted() styles
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around slotted content.** See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for details on how to use the `::slotted()` syntax in a polyfill-friendly way.

</div>

### Configuring styles with custom properties {#configurable}

Static styles are evaluated once per class. Use CSS variables and custom properties to make styles that can be configured at runtime:

```js
static styles = css`
  :host { color: var(--themeColor); }
`;
```

```html
<style>
  html {
    --themeColor: #123456;
  }
</style>
<my-element></my-element>
```

See the section on [CSS custom properties](#customprops) for more information.

## Defining scoped styles in the template {#styles-in-the-template}

We recommend using static styles for optimal performance.  However, sometimes you may want to
define styles in the LitElement template. There are two ways to add scoped styles in the template:

*   Add styles using a `<style>` element.
*   Add styles using an external style sheet.

Each of these techniques has its own set of advantages and drawbacks.

### In a style element

We recommend defining styles using the static `styles` property for optimal performance. However, static styles are evaluated **once per class**. Sometimes, you might need to evaluate styles per instance.

For this, we recommend using CSS properties to create [customizable styles](#customizable). However, you can also include `<style>` elements in a LitElement template. These are updated per instance.

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

The most intuitive way to evaluate per-instance styles has some important limitations and performance issues. We consider the example below to be an anti-pattern:

```js
// Anti-pattern!
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

**Limitations in the ShadyCSS polyfill around expressions.** Expressions in `<style>` elements won't update per instance in ShadyCSS, due to limitations of the ShadyCSS polyfill. See the [ShadyCSS readme](https://github.com/webcomponents/shadycss/blob/master/README.md#limitations) for more information.

</div>

Additionally, evaluating an expression inside a `<style>` element is extremely inefficient. When any text inside a `<style>` element changes, the browser must re-parse the whole `<style>` element, resulting in unnecessary work.

If you need to evaluate expressions inside a `<style>` element, use the following strategy to avoid creating performance problems:

*   Separate styles that require per-instance evaluation from those that don't.

*   Evaluate per-instance CSS properties by creating an expression that captures that property inside a complete `<style>` block. Include it in your template.


{% playground-ide "style/perinstanceexpressions" %}

### Import an external stylesheet {#external-stylesheet}

We recommend placing your styles in a static `styles` property for optimal performance. However, you can include an external style sheet in your template with a `<link>`:

{% playground-ide "style/where" %}

<div class="alert alert-info">

**External stylesheet caveats.**

*  The [ShadyCSS polyfill](https://github.com/webcomponents/shadycss/blob/master/README.md#limitations) doesn't support external style sheets.

*   External styles can cause a flash-of-unstyled-content (FOUC) while they load.

*   The URL in the `href` attribute is relative to the **main document**. This is okay if you're building an app and your asset URLs are well-known, but avoid using external style sheets when building a reusable element.

</div>

## Dynamic classes and styles

One way to make styles dynamic is to add expressions to the `class` or `style` attributes in your template.

Lit offers two directives, `classMap` and `styleMap`, to conveniently apply classes and styles in HTML templates.

For more information on these and other directives, see the documentation on [built-in directives](/guide/templates/directives).

To use `styleMap` and/or `classMap`:

1.  Import `classMap` and/or `styleMap`:

    ```js
    import { classMap } from 'lit-html/directives/class-map';
    import { styleMap } from 'lit-html/directives/style-map';
    ```

2.  Use `classMap` and/or `styleMap` in your element template:

{% playground-ide "style/maps" %}

### classMap syntax {#classmap}

`classMap` applies a set of classes to an HTML element:

{% playground-ide "style/classmap" %}

### styleMap syntax {#stylemap}

`styleMap` applies a set of CSS rules to an HTML element:

{% playground-ide "style/stylemap" %}

To refer to hyphenated properties such as `font-family`, use the camelCase equivalent (`fontFamily`) or place the hyphenated property name in quotes (`'font-family'`).

To refer to custom CSS properties such as `--custom-color`, place the whole property name in quotes (`'--custom-color'`).

|**Inline style or CSS**|**styleMap equivalent**|
|----|----|
| `background-color: blue;` <br/> | `backgroundColor: 'blue'` <br/><br/> or <br/><br/>`'background-color': 'blue'`|
| `font-family: Roboto, Arial, sans-serif;` <br/> | `fontFamily: 'Roboto, Arial, sans-serif'` <br/><br/> or <br/><br/>`'font-family': 'Roboto, Arial, sans-serif'`|
|`--custom-color: #FFFABC;`|`'--custom-color': '#FFFABC;'`|
|`--otherCustomColor: #FFFABC;`|`'--otherCustomColor': '#FFFABC;'`|
|`color: var(--customprop, blue);`|`color: 'var(--customprop, blue)'`|

{% playground-ide "style/stylemap2" %}

## Theming

*   Use [**CSS inheritance**](#inheritance) to propagate style information to LitElement components and their rendered templates.

    ```html
    <style>
      html {
        --themeColor: #123456;
        font-family: Roboto;
      }
    </style>

    <!-- host inherits `--themeColor` and `font-family` and
         passes these properties to its rendered template -->
    <my-element></my-element>
    ```

*   Use [**CSS variables and custom properties**](#customprops) to configure styles per-instance.

    ```html
    <style>
      html {
        --my-element-background-color: /* some color */;
      }
      .stuff {
        --my-element-background-color: /* some other color */;
      }
    </style>
    <my-element></my-element>
    <my-element class="stuff"></my-element>
    ```

    ```js
    // MyElement's static styles
    static styles = css`
      :host {
        background-color: var(--my-element-background-color);
      }
    `;
    ```

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
  font-family: Roboto;
}
</style>
<div>
  <p>Uses Roboto</p>
</div>
```

Similarly, host elements pass down inheritable CSS properties to their shadow trees.

You can use the host element's type selector to style it:

{% playground-ide "style/inherited3" %}

You can also use the `:host` CSS pseudo-class to style the host from inside its own template:

{% playground-ide "style/inherited" %}

#### Type selectors have higher specificity than :host{#specificity}

An element type selector has higher specificity than the `:host` pseudo-class selector. Styles set for a custom element tag will override styles set with `:host` and `:host()`:

{% playground-ide "style/specificity" %}

### CSS custom properties {#customprops}

All CSS custom properties (<code>--<var>custom-property-name</var></code>) inherit. You can use this to make your component's styles configurable from outside.

The following component sets its background color to a CSS variable. The CSS variable uses the value of `--my-background` if it's available, and otherwise defaults to `yellow`:

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

If a component user has an existing app theme, they can easily set the host's configurable properties to use theme properties:

{% playground-ide "style/customproperties" %}

See [CSS Custom Properties on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for more information.

### A simple example theme {#example-theme}

{% playground-ide "style/theming" %}
