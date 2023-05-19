---
title: Internal styles
---

This is an _internal only_ page to demonstrate the styling of our documentation.

## Text

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Headings

<div style="padding:var(--docs-margin-top) 2em; border:2px solid #eaeaea;">

# Heading 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Heading 2
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Heading 3
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

#### Heading 4
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

</div>

## Links

This is a [link](#) to another page or section. [So is this](#).

## Emphasis

This is **bold**.
This is *italic*.
This is ***bold italic***.

## Ordered list

1. This is the first item
2. This is the second item
   1. This is a nested item

## Unordered list

- This is the first item
- This is the second item
   - This is a nested item

## Tables

| Browser  | Module Specifiers     | Modern JS      | Web Components       |
|:---------|:---------------------:|:--------------:|:--------------------:|
| Chrome   | 90                    | 80             | 67                   |
| Safari   | build                 | 13             | 10                   |
| Firefox  | build                 | 72             | 63                   |
| Edge (Chromium) | build          | 80             | 79                   |
| Edge 14-18 | build               | build          | polyfill             |
| Internet Explorer 11 | build     | build          | polyfill             |

## Asides

<div class="alert alert-info">

**Informational asides are lower priority.** These notes fill in information
that's peripheral to the main discussion. Possibly interesting but not
essential. They start with run-in heads so the reader can quickly assess whether
the aside is relevant to their interests. They should look less important than
the surrounding text.

</div>

## Alerts

<div class="alert alert-warning">

**Do not bathe with toasters.** The toaster won't enjoy it, and neither will you. These higher profile admonitions should be more noticeable.

</div>

## Figures

![Inheritance diagram showing LitElement inheriting from ReactiveElement, which in turn inherits from HTMLElement. LitElement is responsible for templating; ReactiveElement is responsible for managing reactive properties and attributes; HTMLElement is the standard DOM interface shared by all native HTML elements and custom elements.](/images/docs/components/lit-element-inheritance.png)

## Inline code

The component's `render` method can return anything that Lit can render.
Typically, it returns a single `TemplateResult` object (the same type returned
by the `html` tag function).

## Non-highlighted code snippet
```
I'm just some code
```

## Highlighted code snippet

```ts
import { LitElement, html, css, customElement } from 'lit-element';

@customElement('my-element');
class MyElement extends LitElement {
  static style = css`
    my-element #id .class [attr~="foo"] ::part(bar) {
      border: 1px solid blue;
    }
  `;

  render() {
    return html`
      Lorem ipsum ${value}!
      <button attribute="value"></button>
      <button attribute=${value}></button>
      <button .property=${value}></button>
      <button ?boolean=${value}></button>
      <button @event=${this.handler}></button>
    `;
  }
}
```

## Switchable sample

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement {
  @property({attribute: false})
  foo;
}
```

```js
class MyElement {
  static properties = {
    foo: {attribute: false}
  };
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

## Interactive code snippet

{% playground-example "v3-docs/templates/define" "my-element.ts" %}

## Full IDE

{% playground-ide "v3-docs/templates/define" %}
