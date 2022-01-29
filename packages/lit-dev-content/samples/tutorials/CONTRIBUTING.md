# Authoring a lit.dev Tutorial

Lit tutorials are a way to provide a guided, interactive learning experience to Lit users. Under the hood it leverages playground elements as well as our markdown renderer.

## Steps for Authoring

<details>
  <summary>Create a directory in <code>/packages/lit-dev-content/tutorials/</code></summary>

This directory name is also going to be a part of the URL e.g. `https://lit.dev/tutorials/tutorial-name`
</details>

<details>
  <summary>In that directory create a <code>tutorial.json</code></summary>

See format in following section
</details>

<details>
  <summary>Create a <code>description.md</code> in that directory that describes the tutorial</summary>

* This will show up in the card catalog
* This file can be empty, but must exist
</details>

<details>
  <summary>Create a directory for each step in your tutorial</summary>

Directory names must start from `00/` and increase numerically as a 2 digit number e.g. `01/` will follow `00/`
</details>

<details>
  <summary>Each step must have a <code>before/</code> and <code>after/</code> subdirectory</summary>

* `before/` holds the playground project for what is first presented to the user
* `after/` holds the playground project for when the user clicks the `solve` button.
</details>

<details>
  <summary>Create a playground project for that step's before and after sections</summary>

See [playground-elements](https://github.com/google/playground-elements#option-2-json-configuration) docs for playground project authoring.
</details>

<details>
  <summary>Create a directory with the same tutorial name in <code>/packages/lit-dev-content/site/tutorials/content/</code></summary>

This will hold the step instructions markdown files.
</details>

<details>
  <summary>For step <code>xy/</code> create a markdown file named <code>xy.md</code> in the <code>content/</code> directory</summary>

These are the instructinos for each step. See the Step Instruction Authoring section for more info.
</details>

<details>
  <summary>Add your tutorial to the catalog by including the tutorial directory name in <code>/packages/lit-dev-content/site/tutorials/tutorials.11tydata.js</code></summary>

For example, if you want to add the tutorial directory `tutorial-name` to the catalog, invoke the `loadTutorialData` function. e.g.

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
  }[]
}
```

## Step Instruction Authoring

When authoring user instruction for a tutorial step, you must create a markdown file with the steup number in its name in the `/packages/lit-dev-content/site/tutorials/content/` directory. e.g. the instructions for step `my-tutorial/05/` should be named `content/my-tutorial/05.md`.

To display code in a step's instructions you can use the `switchable-sample` macro

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

## Good tutorial Habits

<details>
  <summary>The first step should describe to the user what they are going to learn in the tutorial</summary>

Code can be an empty `index.html` or a quick view at the final product.
</details>

<details>
  <summary>Last step should have an action for the user to follow up what they just learned</summary>

* links to other tutorials
* links to next section of docs
</details>

<details>
  <summary>You're on the docs site, link out to relevant documentation</summary>

Teach the user how to empower themselves if they get stuck!
</details>

<details>
  <summary>Determine if you're making a good use of a user's time</summary>

* Take the tutorial yourself
* Time each step
* Add about 30 seconds to a minute to you time for the final time approximation.
* After you've added it all up, look at the total time and ask yourself if a user would like to go through that time commitment for what they learn
* Cut extraneous content
</details>
