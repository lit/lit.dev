# Authoring a lit.dev Tutorial

Lit tutorials are a way to provide a guided, interactive learning experience to Lit users. Under the hood they leverage playground elements as well as our markdown renderer.

## Steps for Authoring

<details>
  <summary>Create a directory in <code>/packages/lit-dev-content/samples/tutorials/</code></summary>

* This directory name is also going to be a part of the URL e.g. `https://lit.dev/tutorials/tutorial-name`
</details>

<details>
  <summary>In that directory create a <code>tutorial.json</code></summary>

* See format in following section.
</details>

<details>
  <summary>Create a <code>description.md</code> in that directory that describes the tutorial</summary>

* This will show up in the card catalog
* This file can be empty, but must exist
</details>

<details>
  <summary>Create a directory for each step in your tutorial</summary>

* Directory names must start from `00/` and increase numerically as a 2 digit number e.g. `01/` will follow `00/`
</details>

<details>
  <summary>If <code>hasAfter: true</code> in tutorial.json the step must have <code>before/</code> and <code>after/</code> subdirectories</summary>

* `before/` holds the playground project for what is first presented to the user
* `after/` holds the playground project for when the user clicks the `solve` button.
  * If `noSolve` is `true` for this step's metadata in `tutorial.json`, then the `solve` will not be shown for the step, and the `after/` folder is not required.
  * If `hasAfter` is `false` or `undefined` for this step's metadata in `tutorial.json`, then the `after/` directory is optional and the solving the step will load the next step's `before/` directory
</details>

<details>
  <summary>If <code>checkable: true</code> in tutorial.json add code checking</summary>

* create a `_check-code.js` file in the `before/` directory
* In your `project.json`
  * set your `"extends"` field to `"/samples/checkable-tutorial-base.json"`
    * e.g. `"extends": "/samples/checkable-tutorial-base.json"`
  * add the code-checking file as a `hidden` file to the step's `project.json`.
    * e.g. `"_check-code.js": { "hidden": true }`
* import the new file in `index.html`
  * e.g.
```html
<head>
  <!-- playground-fold --><script type="module" src="./_check-code.js"></script><!-- playground-fold-end -->

  <script type="module" src="./my-element.js"></script>
</head>
```
* Install the code checker from `'./_check-code-helpers.js'` and pass it an async callback that returns an object of type `{passed: boolean, message?: string}`
* See [Code Checking](#code-checking) for more details
</details>

<details>
  <summary>Create a playground project for that step's before and after sections</summary>

* See [playground-elements](https://github.com/google/playground-elements#option-2-json-configuration) docs for playground project authoring.
</details>

<details>
  <summary>Create a directory with the same tutorial name in <code>/packages/lit-dev-content/site/tutorials/content/</code></summary>

* This will hold the step instructions markdown files.
</details>

<details>
  <summary>For step <code>xy/</code> create a markdown file named <code>xy.md</code> in the <code>content/</code> directory</summary>

* These are the instructinos for each step. See the Step Instruction Authoring section for more info.
</details>

<details>
  <summary>Add your tutorial to the catalog by including the tutorial directory name in <code>/packages/lit-dev-content/site/tutorials/tutorials.11tydata.js</code></summary>

* For example, if you want to add the tutorial directory `tutorial-name` to the catalog, invoke the `loadTutorialData` function. e.g.

```js
const tutorials = await Promise.all([
  ...
  loadTutorialData('tutorial-name'),
  ...
]);
```
</details>

## tutorial.json Format

```ts
interface TutorialManifest {
  // The title of the tutorial. This shows up as the title in
  // the catalog card and in the tutorial itself
  header: string;
  // The difficulty of the tutorial
  difficulty: '' | 'Beginner' | 'Intermediate' | 'Advanced';
  // The size of the card in the catalog NOTE: you may have to
  // trigger `npm run dev` to make this change reflect
  size: 'tiny'|'small'|'medium'|'large';
  // Approximate duration in minutes of the tutorial to be
  // displayed on the catalog card. Set to 0 if you don't
  // want to display a duration
  duration: number;
  // Category to display it in the catalog. Can be any string
  // actually, but 'Learn' and 'Build' will actually make it
  // display in the appropriate sections in the catalog
  category: 'Learn' | 'Build' | 'Draft';
  // Location of the image to display relative to site root.
  // e.g. "images/animations.gif"
  imgSrc?: string;
  // Alt text for the image
  imgAlt?: string;
  // Array of tutorial step titles to display in the tutorial
  // itself. Also used to calculate number of steps in tutorial
  steps: {
    // Title of the current step
    title: string;
    // If false or omitted, the "after" code will be set to the "before" code of
    // the next step. This is useful for reducing code duplication when the
    // next step is the "solved" code for the previous step.
    //
    // Set to true if there is an "after" directory for this step or if it is
    // the last step in the tutorial.
    hasAfter?: boolean;
    // Set to true if there should be no "solve" button for this step; in this
    // case no "after" folder is required.
    noSolve?: boolean;
    // Whether or not the step is code checkable. see the `Code Checking`
    // section below for more details.
    checkable?: boolean;
  }[]
}
```

## Step Instruction Authoring

When authoring user instructions for a tutorial step, create a markdown file with the step number in its name in the `/packages/lit-dev-content/site/tutorials/content/` directory. For example, the instructions for step `my-tutorial/05/` should be named `content/my-tutorial/05.md`.

### Switchable samples

To display code in the instructions you can use the `switchable-sample` macro

<pre>
{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false}) items = [1,2,3];
  render() {
    html`
      &lt;ul>
        ${this.items.map(item => html`&lt;li>${item}&lt;/li>`)}
      &lt;/ul>`;
  }
}
```

```js
class MyElement extends LitElement {
  render() {
    static properties = {items: {attribute: false}};
    constructor() {
      super();
      this.items = [1,2,3];
    }

    html`
      &lt;ul>
        ${this.items.map(item => html`&lt;li>${item}&lt;/li>`)}
      &lt;/ul>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}
</pre>

### Asides

You can also insert an aside in your instructions by using the following format:

```html
{% aside "positive" %}

The first line is always a bolded header.

Make sure to do `this`!

{% endaside %}

{% aside "warn" "no-header" %}

The `no-header` will make sure that this line is not bolded.

Beware of `this`!

{% endaside %}

{% aside "negative" %}

Make sure NOT to do `this`!

The following non-header lines here make sense to explain the assertion in
the header line above.

{% endaside %}

{% aside "info" %}

Check out more info [in this docs section](/docs/templates/expressions/#well-formed-html).

{% endaside %}
```

*Note:* markdown will only be parsed as markdown if there is an empty line
between the text and the HTML tag.

The available asides are:

* `positive`
* `warn`
* `negative`
* `info`
* `labs`

## Code Checking

To enable code checking for a step, add the `checkable: true` flag to the step in `tutorial.json`.

Next create a file which will run your code checking. In this example we will call it `_check-code.js`.

> ⚠️ **Note:** you **MUST** use a `.js` file extension or else this repo will not be able to TS build because we use playground-elements to inject the hidden `_check-code-helpers.js` file.

Then add this code check file as a `hidden` file to the `project.json` of the `before` directory.

Additionally make sure your `project.json` extends from `/samples/checkable-tutorial-base.json` to include the hidden `_check-code-helpers.js` communication file.

<details open>
  <summary>example: <code>/before/project.json</code></summary>

```json
{
  "extends": "/samples/checkable-tutorial-base.json",
  "files": {
    "index.html": {},
    "my-element.ts": {},
    "_check-code.js": {"hidden": true}
  }
}
```
</details>

Next, import this new file into your `index.html` file. And feel free to add the `<!-- playground-hide(-end) -->` comments to hide the import.


<details open>
  <summary>example: <code>index.html</code></summary>

```html
<head>
  <!-- playground-hide --><script type="module" src="./_check-code.js"></script><!-- playground-hide-end -->
  <script type="module" src="./my-element.js"></script>
</head>
<body>
  <my-element name="User"></my-element>
</body>
```
</details>

In your `_check-code.js` file, import and call `installCodeChecker` from the hidden `'./_check-code-helpers.js'` file which is injected by playground elements in `checkable-tutorial-base.json`.

`installCodeChecker` will set up communications between the tutorial page and the playground and call an async callback when the user requests code checking.

The return type of the callback should be:

`{passed: boolean, message?: string}`

Where `passed` is whether the code has passed the checks and `message` is the optional error message to display.

<details open>
  <summary>example: <code>check-code.js</code></summary>

```js
import {installCodeChecker} from './_check-code-helpers.js';

installCodeChecker(async () => {
  let passed = true;
  let message = '';

  const element = document.body.querySelector('my-element');
  const nameAttribute = element.getAttribute('name');

  if (element.name === undefined) {
    passed = false;
    message = `Define the 'name' property on the element.`;
  } else if (element.name !== nameAttribute) {
    passed = false;
    message = `The element's name property is not a reactive property.`;
  }

  return {passed, message};
});
```
</details>

## Good tutorial Habits

<details>
  <summary>The first step should describe to the user what they are going to learn in the tutorial</summary>

* Code can be an empty `index.html` or a quick view at the final product.
</details>

<details>
  <summary>Last step should have an action for the user to follow up what they just learned</summary>

* links to other tutorials
* links to next section of docs
</details>

<details>
  <summary>You're on the docs site, link out to relevant documentation</summary>

* Teach the user how to empower themselves if they get stuck!
</details>

<details>
  <summary>Determine if you're making a good use of a user's time</summary>

* Take the tutorial yourself
* Time each step
* Add about 30 seconds to a minute to you time for the final time approximation.
* After you've added it all up, look at the total time and ask yourself if a user would like to go through that time commitment for what they learn
* Cut extraneous content
</details>
