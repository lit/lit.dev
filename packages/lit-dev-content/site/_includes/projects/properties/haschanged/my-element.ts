import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({
    // only update if newVal is larger than oldVal.
    hasChanged(newVal: number, oldVal: number) {
      const hasChanged: boolean = newVal > oldVal;
      console.log(`${newVal}, ${oldVal}, ${hasChanged}`);
      return hasChanged;
    }
  })
  value: number = 1;

  render(){
    return html`
      <p>${this.value}</p>
      <button @click="${this.getNewVal}">Get new value</button>
    `;
  }

  getNewVal(){
    this.value = Math.floor(Math.random()*10);
  }
}
