import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {repeat} from 'lit/directives/repeat.js';
import {animate, fadeOut, flyBelow} from '@lit-labs/motion';
import {styles} from './styles.js';
import {TextField} from '@material/mwc-textfield';
import {Checkbox} from '@material/mwc-checkbox';
import '@material/mwc-textfield';
import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';

const data = [
  {id: 1, value: 'Go running.', completed: false},
  {id: 2, value: 'Strength training', completed: true},
  {id: 3, value: 'Walk with friends.', completed: false},
  {id: 4, value: 'Feed the cats.', completed: true},
  {id: 5, value: 'Shop for dinner.', completed: false},
  {id: 6, value: 'Order clothes.', completed: false},
  {id: 7, value: 'BBQ!', completed: false},
];

type DataItem = typeof data[number];

@customElement('motion-todos')
export class MotionTodos extends LitElement {
  static styles = styles;

  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
    delegatesFocus: true,
  };

  @property({type: Array}) data = data;

  @query('mwc-textfield') textField!: TextField;

  addItem() {
    if (!this.textField.value) {
      return;
    }
    const nextId = this.data[this.data.length - 1].id + 1;
    this.data = [
      ...this.data,
      {
        id: nextId,
        value: this.textField.value,
        completed: false,
      },
    ];
    this.textField.value = '';
  }

  removeItem(item: DataItem) {
    this.data = this.data.filter((i) => i != item);
  }

  updateItem(updatingItem: DataItem, completed: boolean) {
    this.data = this.data.map((item) => {
      if (updatingItem === item) {
        updatingItem.completed = completed;
      }
      return item;
    });
  }

  render() {
    const keyframeOptions = {
      duration: 500,
      fill: 'both' as FillMode,
    };
    const list = (completed = false) => html`<div
      class="list ${classMap({completed})}"
    >
      <h3>${completed ? `Completed` : `Todos`}</h3>
      <ul tabindex="-1">
        ${repeat(
          this.data.filter((item) =>
            completed ? item.completed : !item.completed
          ),
          (item) => item.id,
          (item) => html`<li
            ${animate({
              keyframeOptions,
              in: flyBelow,
              out: fadeOut,
              stabilizeOut: true,
              id: `${item.id}:${completed ? 'right' : 'left'}`,
              inId: `${item.id}:${completed ? 'left' : 'right'}`,
              skipInitial: true,
            })}
          >
            <mwc-formfield label="${item.id}. ${item.value}"
              ><mwc-checkbox
                type="checkbox"
                ?checked=${completed}
                @change=${(e: Event) =>
                  this.updateItem(item, (e.target! as Checkbox).checked)}
              ></mwc-checkbox></mwc-formfield
            ><button @click=${() => this.removeItem(item)}>
              remove_circle_outline
            </button>
          </li>`
        )}
      </ul>
    </div>`;
    return html`
      <mwc-textfield outlined label="Enter a todo..."></mwc-textfield>
      <div class="controls">
        <mwc-button @click=${this.addItem} raised>Add Todo</mwc-button>
      </div>
      <div class="lists">${list()} ${list(true)}</div>
    `;
  }
}
