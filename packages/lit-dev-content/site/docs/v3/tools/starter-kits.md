---
title: Starter kits
eleventyNavigation:
  key: Starter kits
  parent: Tools
  order: 7
versionLinks:
  v1: getting-started/#component-project
  v2: tools/starter-kits/
---

The Lit Starter Kit is a project template for reusable Lit components that can be published for others to use.

To get started working on a component locally, you can use the [Lit TypeScript starter project](https://github.com/lit/lit-element-starter-ts).

The project defines a Lit component. It also adds a set of optional tools for developing, linting, and testing the component:

*   Node.js and npm for managing dependencies. _Requires Node.js 10 or greater._
*   A local dev server,  [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/).
*   Linting with [ESLint](https://eslint.org/) and [lit-analyzer](https://www.npmjs.com/package/lit-analyzer).
*   Testing with [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/).
*   A static doc site built with [web-component-analyzer](https://www.npmjs.com/package/web-component-analyzer) and [eleventy](https://www.11ty.dev/).

None of these tools is _required_ to work with Lit. They represent one possible set of tools for a good developer experience.

<div class="alert alert-info">

**Alternative starting point.** As an alternative to the official Lit starter projects, the Open WC project has a [project generator](https://open-wc.org/docs/development/generator/) for web components using Lit. The Open WC script asks a series of questions and scaffolds out a project for you.

</div>

### Download the starter project

The quickest way to try out a project locally is to download the starter project as a zip file.

1.  Download the [starter project](https://github.com/lit/lit-element-starter-ts/archive/main.zip) from GitHub as a zip file.

1.  Uncompress the zip file.

1.  Install dependencies.

    ```bash
    cd <project folder>
    npm i
    ```

<div class="alert alert-info">

**Want it on GitHub?** If you're familiar with git you may want to create a GitHub repository for your starter project,
instead of just downloading the zip file. You can use the [GitHub template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) feature to create your own repository from the [starter project](https://github.com/lit/lit-element-starter-ts). Then clone your new repository and install dependencies, as above.

</div>

### Try out your project

1.  Build your project:

    ```bash
    npm run build
    ```

    To watch files and rebuild when the files are modified, run the following command in a separate shell:

    ```bash
    npm run build:watch
    ```

1.  Run the dev server:

    ```bash
    npm run serve
    ```

1.  Open the project demo page in a browser tab. For example:

    [http://localhost:8000/dev/](http://localhost:8000/dev/)

    Your server may use a different port number. Check the URL in the terminal output for the correct port number.


### Edit your component

Edit your component definition in the `my-element.ts` file in the `src` directory.

A couple of things to look for in the code:

*   The code defines a class for the component (`MyElement`) and registers it with the browser as a custom element named `<my-element>`.

    {% switchable-sample %}

    ```ts
    @customElement('my-element')
    export class MyElement extends LitElement { /* ... */ }
    ```

    ```js
    export class MyElement extends LitElement { /* ... */ }

    customElements.define('my-element', MyElement);
    ```

    {% endswitchable-sample %}


*   The component's `render` method defines a [template](/docs/v3/templates/overview/) that will be rendered as a part of the component. In this case, it includes some text, some data bindings, and a button. For more information, see [Templates](/docs/v3/templates/overview/).

    ```js
    export class MyElement extends LitElement {
      // ...
      render() {
        return html`
          <h1>Hello, ${this.name}!</h1>
          <button @click=${this._onClick}>
            Click Count: ${this.count}
          </button>
          <slot></slot>
        `;
      }
    }
    ```

*   The component defines some properties. The component responds to changes in these properties (for example, by re-rendering the template when necessary). For more information, see [Properties](/docs/v3/components/properties/).

    {% switchable-sample %}

    ```ts
    export class MyElement extends LitElement {
      // ...
      @property({type: String})
      name = 'World';
      //...
    }
    ```

    ```js
    export class MyElement extends LitElement {
      // ...
      static properties = {
        name: {type: String}
      };

      constructor() {
        super();
        this.name = 'World';
      }
      // ...
    }
    ```

    {% endswitchable-sample %}


### Rename your component

You'll probably want to change the component name from "my-element" to something more appropriate. This is easiest to do using an IDE or other text editor that lets you do a global search and replace through an entire project.

1.  Remove generated files:

    ```bash
    npm run clean
    ```

1.  Search and replace "my-element" with your new component name in all files in your project (except in the `node_modules` folder).
1.  Search and replace "MyElement" with your new class name in all files in your project (except in the `node_modules` folder).
1.  Rename the source and test files to match the new component name:

    * `src/my-element.ts`
    * `src/test/my-element_test.ts`

1.  Rebuild the project:

    ```bash
    npm run build
    ```

1.  Test and make sure your component is still working:

    ```bash
    npm run serve
    ```

### Next steps

Ready to add features to your component? Head over to [Components](/docs/v3/components/overview/) to learn about building your first Lit component, or [Templates](/docs/v3/templates/overview/) for details on writing templates.

For details on running tests and using other tools, see the [starter project README](https://github.com/lit/lit-element-starter-ts/blob/main/README.md).

For a guide on publishing your component to `npm`, see [Publishing](/docs/v3/tools/publishing/).
