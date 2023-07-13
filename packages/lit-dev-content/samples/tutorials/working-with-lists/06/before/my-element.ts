import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';

@customElement('my-element')
class MyElement extends LitElement {
  @state()
  things = [
    "Raindrops on roses",
    "Whiskers on kittens",
    "Bright copper kettles",
    "Warm woolen mittens",
  ];

  render() {
    return html`
      <p>A few of my favorite things</p>
      <ul>
        <!-- TODO: Add click event handlers for the delete button  below. -->
        ${map(
          this.things,
          (thing, index) => html`
            <li>
              ${thing}
              <button>Delete</button>
            </li>
          `
        )}
      </ul>
    `;
  }

  // TODO: Implement method to delete an item.
}
