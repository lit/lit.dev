import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {ClockController} from './clock-controller.js';

@customElement('my-element')
class MyElement extends LitElement {

  // Create the controller and store it
  private _clock = new ClockController(this, 100);

  render() {
    // Use the controller in render()
    const formattedTime = timeFormat.format(this._clock.value);
    return html`
      <p>
        The current time is:<br>
        ${formattedTime}
      </p>
    `;
  }
}

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: 'numeric', second: 'numeric',
});
