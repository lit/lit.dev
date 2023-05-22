/* playground-fold */
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
/* playground-fold-end */

import {repeat} from 'lit/directives/repeat.js';
/* playground-fold */

@customElement('my-element')
class MyElement extends LitElement {

private sort = 1;

@property() employees = [
  {id: 0, givenName: 'Fred', familyName: 'Flintstone'},
  {id: 1, givenName: 'George', familyName: 'Jetson'},
  {id: 2, givenName: 'Barney', familyName: 'Rubble'},
  {id: 3, givenName: 'Cosmo', familyName: 'Spacely'}
];
/* playground-fold-end */

render() {
  return html`
    <ul>
      ${repeat(this.employees, (employee) => employee.id, (employee, index) => html`
        <li>${index}: ${employee.familyName}, ${employee.givenName}</li>
      `)}
    </ul>
    <button @click=${this.toggleSort}>Toggle sort</button>
  `;
}
/* playground-fold */

private toggleSort() {
  this.sort *= -1;
  this.employees = [...this.employees.sort((a, b) =>
    this.sort * (a.familyName.localeCompare(b.familyName) ||
    a.givenName.localeCompare(b.givenName)))];
}

}
/* playground-fold-end */
